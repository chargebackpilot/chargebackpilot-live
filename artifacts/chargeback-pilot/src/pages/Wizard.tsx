import { MainLayout } from "@/components/layout/MainLayout";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateCase } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wizardSchema, type WizardFormData } from "@/components/wizard/wizard-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PaywallModal } from "@/components/PaywallModal";
import { PaypalGuide } from "@/components/PaypalGuide";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  Scale,
  Clock,
  ChevronRight,
  Siren,
  TrendingUp,
  FileText,
  Building2,
  Landmark,
  Check,
  Loader2,
  MessageSquare,
  Download,
  FileSignature,
} from "lucide-react";

import {
  PAYMENT_METHODS,
  PROBLEM_TYPES,
  MERCHANT_RESPONSE_OPTIONS,
  EVIDENCE_GROUPS,
  STEP_TITLES,
  STRUCTURED_QUESTIONS,
} from "@/components/wizard/wizard-constants";
import {
  buildDescription,
  buildMerchantResponse,
  getDisputedPercent,
  extractSubject,
  extractBody,
} from "@/components/wizard/wizard-helpers";
import {
  GeneratorLoader,
  StrategyIndicator,
  LockedTeaser,
  CopyableTemplate,
  MerchantQuickSelect,
  QuestionField,
  CaseQualityPanel,
  EvidenceCoach,
  ActionPlanPanel,
} from "@/components/wizard/WizardComponents";
import {
  getCaseQuality,
  getEvidenceRecommendations,
  getPaymentNextStep,
  countEvidenceStatuses,
  type EvidenceStatus,
} from "@/components/wizard/wizard-insights";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LetterGenerator } from "@/components/LetterGenerator";
import {
  CASE_NAVIGATION_EVENT,
  PENDING_PAYWALL_SCROLL_KEY,
  saveCurrentCase,
  loadCurrentCase,
  setCurrentCaseById,
  markCaseIdUnlocked,
  isCaseUnlocked,
  isFlatrateActive,
  getFlatrateSessionId,
  clearCurrentCase,
} from "@/lib/case-persistence";
import { getAdminToken } from "@/lib/admin-api";
import { trackWizardEvent } from "@/lib/analytics";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileScriptPromise: Promise<void> | null = null;

interface FormData {
  paymentMethod: string;
  problemType: string;
  merchantName: string;
  purchaseAmount: string;
  disputedAmount: string;
  paymentDate: string;
  merchantCountry: string;
  merchantContacted: boolean;
  merchantResponseType: string;
  merchantResponseNote: string;
  evidence: string[];
  evidenceStatus: Record<string, EvidenceStatus>;
  structuredAnswers: Record<string, string>;
}

type CaseResult = ReturnType<typeof useCreateCase>["data"];
type ResolvedCaseResult = NonNullable<CaseResult>;

function hasUnlockedAnalysisContent(data: CaseResult): boolean {
  const analysis = data?.analysis;
  return Boolean(
    analysis?.merchantTemplate || analysis?.bankTemplate || analysis?.escalationTemplate
  );
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return 0;
  const status = Number((error as { status?: unknown }).status);
  return Number.isFinite(status) ? status : 0;
}

function describeCreateCaseError(error: unknown) {
  const status = getErrorStatus(error);
  const message = error instanceof Error ? error.message : "";

  if (status === 429 || /rate_limit|zu viele|too many/i.test(message)) {
    return {
      title: "Zu viele Anfragen",
      description:
        "Bitte warte kurz und starte die Analyse danach erneut. Deine Eingaben bleiben erhalten.",
    };
  }

  if (status === 403 || /turnstile|sicherheitspr/i.test(message)) {
    return {
      title: "Sicherheitsprüfung fehlgeschlagen",
      description:
        "Bitte lade die Seite neu oder versuche es in einem anderen Browser erneut. Deine Eingaben bleiben gespeichert.",
    };
  }

  if (status === 400) {
    return {
      title: "Eingaben prüfen",
      description:
        "Eine Angabe konnte nicht verarbeitet werden. Bitte prüfe Betrag, Datum und Pflichtfelder noch einmal.",
    };
  }

  if (status >= 500 || /gemini|unavailable|datenbank|database/i.test(message)) {
    return {
      title: "Analyse gerade nicht verfügbar",
      description:
        "Der Analyse-Dienst war kurz nicht erreichbar. Deine Eingaben bleiben erhalten; bitte versuche es gleich erneut.",
    };
  }

  return {
    title: "Analyse fehlgeschlagen",
    description: "Bitte versuche es erneut. Deine Eingaben bleiben erhalten.",
  };
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

function waitForTurnstileApi(timeoutMs = 8000) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Turnstile is only available in the browser"));
      return;
    }
    if (window.turnstile) {
      resolve();
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(interval);
        resolve();
        return;
      }
      if (Date.now() - startedAt > timeoutMs) {
        window.clearInterval(interval);
        reject(new Error("Turnstile script did not become ready in time"));
      }
    }, 100);
  });
}

function ensureTurnstileScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Turnstile can only be loaded in the browser"));
  }
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);
  if (!existing) {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  turnstileScriptPromise = waitForTurnstileApi().catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });
  return turnstileScriptPromise;
}

export default function Wizard() {
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const disputedInputRef = useRef<HTMLInputElement | null>(null);
  const paywallAnchorRef = useRef<HTMLDivElement | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const lastWizardDraftTrackedAtRef = useRef(0);
  const stepStartedAtRef = useRef(Date.now());
  const trackedStepRef = useRef(1);
  const [_location] = useLocation();
  const [navigationKey, setNavigationKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncNavigationKey = () => {
      setNavigationKey(
        `${window.location.pathname}${window.location.search}${window.location.hash}`
      );
    };
    window.addEventListener("popstate", syncNavigationKey);
    window.addEventListener(CASE_NAVIGATION_EVENT, syncNavigationKey);
    return () => {
      window.removeEventListener("popstate", syncNavigationKey);
      window.removeEventListener(CASE_NAVIGATION_EVENT, syncNavigationKey);
    };
  }, []);

  const rawSearch =
    typeof window !== "undefined"
      ? window.location.search
      : navigationKey.includes("?")
        ? `?${navigationKey.split("?")[1]?.split("#")[0] ?? ""}`
        : "";
  const params = new URLSearchParams(rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch);
  const prefilledProblem = params.get("problem") ?? "";
  const prefilledPaymentRaw = params.get("payment") ?? params.get("paymentMethod") ?? "";
  const prefilledPayment = PAYMENT_METHODS.some((pm) => pm.id === prefilledPaymentRaw)
    ? prefilledPaymentRaw
    : "";
  const prefilledMerchant = (params.get("merchant") ?? params.get("shop") ?? "").slice(0, 80);
  const hasAnyPrefill = !!(prefilledProblem || prefilledPayment || prefilledMerchant);
  const paymentSuccess = params.get("payment_success") === "1";
  const paymentCancel = params.get("payment_cancel") === "1";
  const sessionIdParam = params.get("session_id");
  const caseIdParam = params.get("caseId") ?? params.get("case_id");
  const forceNew = params.get("new") === "1";
  const scrollTarget = params.get("scroll");

  // SSR-safe initial render: never read localStorage during render, otherwise the
  // server can render step 1 while the client immediately renders a restored case.
  // That causes a hydration mismatch (#418 in minified React).
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [step, setStep] = useState<number>(1);

  // hasUnlocked: bound to specific caseId; flatrate also unlocks
  const [hasUnlocked, setHasUnlocked] = useState<boolean>(false);

  // On return from Stripe Checkout: verify server-side, then bind unlock to caseId.
  // Keep caseId/scroll/new query params available for the restore effect below; stripping
  // them here before React has applied the selected case can make in-app navigation look
  // like the URL changed while the wizard content stayed stale.
  useEffect(() => {
    if (paymentSuccess && sessionIdParam) {
      // Pin the case this session is allowed to unlock — anti-replay against
      // reusing a paid session_id to unlock a different case in-session.
      const expectedCaseId = caseIdParam
        ? String(caseIdParam)
        : (loadCurrentCase()?.caseId ?? null);
      fetch(`/api/stripe/checkout/verify/${encodeURIComponent(sessionIdParam)}`)
        .then((r) => r.json())
        .then((j) => {
          if (!j?.paid || j?.mode !== "single" || !j?.caseId) return;
          // Persist server-confirmed unlock for that specific caseId
          markCaseIdUnlocked(String(j.caseId));
          // Only flip the UI when the returned caseId matches the case we're viewing
          if (expectedCaseId && String(j.caseId) === expectedCaseId) {
            const readToken = getStoredReadToken(expectedCaseId);
            if (!readToken) {
              setHasUnlocked(false);
              toast({
                title: "Fall konnte nicht geladen werden",
                description:
                  "Die Zahlung wurde bestätigt. Bitte öffne den Fall erneut über „Meine Fälle”.",
                variant: "destructive",
              });
              return;
            }
            void unlockCaseContent(expectedCaseId, readToken, form.getValues()).catch(() => {
              setHasUnlocked(false);
              toast({
                title: "Freischaltung noch nicht abrufbar",
                description:
                  "Die Zahlung wurde bestätigt. Bitte lade den Fall in wenigen Sekunden erneut.",
                variant: "destructive",
              });
            });
          }
        })
        .catch(() => {
          /* verify failed — user stays locked, can retry */
        })
        .finally(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("payment_success");
          url.searchParams.delete("session_id");
          url.searchParams.delete("payment_cancel");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        });
    } else if (paymentCancel) {
      // Strip cancel param — case state is already restored from localStorage
      const url = new URL(window.location.href);
      url.searchParams.delete("payment_cancel");
      url.searchParams.delete("case_id");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);
  const validatedPrefilledProblem = PROBLEM_TYPES.some((pt) => pt.id === prefilledProblem)
    ? prefilledProblem
    : "";
  const form = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      paymentMethod: prefilledPayment,
      problemType: validatedPrefilledProblem,
      merchantName: prefilledMerchant,
      purchaseAmount: "",
      disputedAmount: "",
      paymentDate: "",
      merchantCountry: "",
      merchantContacted: false,
      merchantResponseType: "",
      merchantResponseNote: "",
      evidence: [],
      evidenceStatus: {},
      structuredAnswers: {},
    },
    mode: "onTouched",
  });

  const formData = form.watch();

  const setFormData = (
    updater: Partial<WizardFormData> | ((prev: WizardFormData) => WizardFormData)
  ) => {
    const prev = form.getValues();
    const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
    (Object.keys(next) as Array<keyof WizardFormData>).forEach((key) => {
      form.setValue(key, next[key] as WizardFormData[typeof key], { shouldValidate: true });
    });
  };

  const createCase = useCreateCase();
  const [result, setResult] = useState<CaseResult>(undefined);
  const [resultViewKey, setResultViewKey] = useState(0);
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);
  const { toast } = useToast();
  const wizardDraftSignature = JSON.stringify({
    paymentMethod: formData.paymentMethod,
    problemType: formData.problemType,
    merchantName: formData.merchantName,
    purchaseAmount: formData.purchaseAmount,
    disputedAmount: formData.disputedAmount,
    paymentDate: formData.paymentDate,
    merchantCountry: formData.merchantCountry,
    merchantContacted: formData.merchantContacted,
    merchantResponseType: formData.merchantResponseType,
    evidence: formData.evidence,
    evidenceStatus: formData.evidenceStatus,
  });

  useEffect(() => {
    const previousStep = trackedStepRef.current;
    if (previousStep !== step && previousStep < 6) {
      const values = form.getValues();
      trackWizardEvent("step_duration", previousStep, {
        ...values,
        durationMs: Date.now() - stepStartedAtRef.current,
        qualityScore: getCaseQuality(values).score,
      });
    }
    trackedStepRef.current = step;
    stepStartedAtRef.current = Date.now();
    trackWizardEvent("wizard_step", step, form.getValues());
  }, [step]);

  useEffect(() => {
    const handlePageHide = () => {
      const currentStep = trackedStepRef.current;
      if (currentStep >= 6) return;
      const values = form.getValues();
      trackWizardEvent("wizard_abandon", currentStep, {
        ...values,
        durationMs: Date.now() - stepStartedAtRef.current,
        qualityScore: getCaseQuality(values).score,
      });
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [form]);

  useEffect(() => {
    if (step >= 6) return;
    const elapsed = Date.now() - lastWizardDraftTrackedAtRef.current;
    const delay = Math.max(1500, 12_000 - elapsed);
    const timer = window.setTimeout(() => {
      lastWizardDraftTrackedAtRef.current = Date.now();
      trackWizardEvent("wizard_draft", step, form.getValues());
    }, delay);
    return () => window.clearTimeout(timer);
  }, [step, wizardDraftSignature]);

  function saveCaseSnapshot(
    data: ResolvedCaseResult,
    formSnapshot: WizardFormData | FormData = form.getValues()
  ) {
    const caseId = String(data.id ?? "");
    if (!caseId) return;

    saveCurrentCase({
      caseId,
      readToken: data.readToken,
      merchantName: data.merchantName ?? formSnapshot.merchantName ?? "",
      amount: Number(data.amount ?? formSnapshot.disputedAmount ?? 0),
      paymentMethod: data.paymentMethod ?? formSnapshot.paymentMethod ?? "",
      problemType: data.problemType ?? formSnapshot.problemType ?? "",
      paymentDate: data.paymentDate ?? formSnapshot.paymentDate ?? "",
      successProbability: data.analysis?.successProbability ?? 0,
      successProbabilityLabel: data.analysis?.successProbabilityLabel ?? "",
      createdAt: data.createdAt ?? new Date().toISOString(),
      result: data,
      formData: formSnapshot,
    });
  }

  function getStoredReadToken(caseId: string | undefined | null) {
    if (!caseId) return undefined;
    if (
      result?.id !== null &&
      result?.id !== undefined &&
      String(result.id) === String(caseId) &&
      result.readToken
    ) {
      return result.readToken;
    }
    const current = loadCurrentCase();
    if (current?.caseId === String(caseId)) {
      return current.readToken ?? (current.result as { readToken?: string } | undefined)?.readToken;
    }
    const selected = setCurrentCaseById(String(caseId));
    return (
      selected?.readToken ?? (selected?.result as { readToken?: string } | undefined)?.readToken
    );
  }

  async function unlockCaseContent(
    caseId: string,
    readToken: string | undefined,
    formSnapshot: WizardFormData | FormData = form.getValues()
  ) {
    const flatrateSessionId = getFlatrateSessionId();
    const adminToken = getAdminToken();

    if (flatrateSessionId?.startsWith("admin_test_") && adminToken) {
      const params = new URLSearchParams();
      if (readToken) params.set("readToken", readToken);
      const response = await fetch(
        `/api/admin/cases/${encodeURIComponent(caseId)}/unlock-preview?${params}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (!response.ok) throw new Error("admin unlock preview failed");
      const unlocked = (await response.json()) as ResolvedCaseResult;
      const unlockedWithToken =
        readToken && !unlocked.readToken
          ? ({ ...unlocked, readToken } as ResolvedCaseResult)
          : unlocked;
      setResult(unlockedWithToken);
      setResultViewKey((key) => key + 1);
      setHasUnlocked(true);
      markCaseIdUnlocked(caseId);
      saveCaseSnapshot(unlockedWithToken, formSnapshot);
      return unlockedWithToken;
    }

    if (!readToken) throw new Error("missing read token");

    const params = new URLSearchParams({ readToken });
    if (flatrateSessionId) params.set("flatrateSessionId", flatrateSessionId);

    const response = await fetch(`/api/cases/${encodeURIComponent(caseId)}/unlock?${params}`);
    if (!response.ok) throw new Error("unlock failed");

    const unlocked = (await response.json()) as ResolvedCaseResult;
    setResult(unlocked);
    setResultViewKey((key) => key + 1);
    setHasUnlocked(true);
    markCaseIdUnlocked(caseId);
    saveCaseSnapshot(unlocked, formSnapshot);
    return unlocked;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (forceNew) {
      clearCurrentCase();
      setResult(undefined);
      setStep(1);
      setHasUnlocked(false);
      setAcceptedLegal(false);
      form.reset({
        paymentMethod: prefilledPayment,
        problemType: validatedPrefilledProblem,
        merchantName: prefilledMerchant,
        purchaseAmount: "",
        disputedAmount: "",
        paymentDate: "",
        merchantCountry: "",
        merchantContacted: false,
        merchantResponseType: "",
        merchantResponseNote: "",
        evidence: [],
        evidenceStatus: {},
        structuredAnswers: {},
      });
      return;
    }

    if (caseIdParam) {
      // Explicit case selection is handled by the dedicated effect below so that
      // switching between saved results always shows the standard generation/result
      // animation instead of replacing the content abruptly.
      return;
    }

    // Restore the persisted in-progress case ONLY when there's no fresh prefill from a
    // landing-page CTA (problem/payment/merchant). A fresh CTA click means "start a new
    // case with these values" — we shouldn't silently resurrect an old half-filled form.
    const persisted = paymentSuccess || paymentCancel || !hasAnyPrefill ? loadCurrentCase() : null;

    const restoredResult = (persisted?.result as CaseResult) ?? undefined;
    const restoredFormData = (persisted?.formData as FormData | undefined) ?? null;

    if (restoredFormData) {
      form.reset(restoredFormData);
    }

    setResult(restoredResult);
    setStep(restoredResult ? 6 : 1);
    const shouldUnlock =
      isFlatrateActive() || (persisted?.caseId ? isCaseUnlocked(persisted.caseId) : false);
    setHasUnlocked(false);
    if (persisted?.caseId && shouldUnlock && restoredResult) {
      void unlockCaseContent(
        persisted.caseId,
        getStoredReadToken(persisted.caseId),
        restoredFormData ?? form.getValues()
      ).catch(() => setHasUnlocked(false));
    }
    // This effect intentionally runs for navigation inputs only. Adding mutation objects
    // such as createCase here can reset the form on every mutation-state render and break
    // wizard progression (e.g. the "Weiter" button appears to do nothing).
  }, [navigationKey]);

  useEffect(() => {
    if (!caseIdParam || forceNew) return;
    const selected = setCurrentCaseById(caseIdParam);
    if (!selected) return;

    const selectedResult = (selected.result as CaseResult) ?? undefined;
    const selectedFormData = (selected.formData as FormData | undefined) ?? null;
    if (selectedFormData) {
      form.reset(selectedFormData);
    }
    setStep(selectedResult ? 6 : 1);
    setResult(selectedResult);
    setResultViewKey((key) => key + 1);
    const shouldUnlock = isFlatrateActive() || isCaseUnlocked(selected.caseId);
    setHasUnlocked(false);
    if (shouldUnlock && selectedResult) {
      void unlockCaseContent(
        selected.caseId,
        getStoredReadToken(selected.caseId),
        selectedFormData ?? form.getValues()
      ).catch(() => setHasUnlocked(false));
    }
    setAcceptedLegal(false);
  }, [caseIdParam, forceNew, form]);

  const setAnswer = (id: string, val: string) => {
    const prev = form.getValues();
    form.setValue(
      "structuredAnswers",
      { ...prev.structuredAnswers, [id]: val },
      { shouldValidate: true }
    );
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof WizardFormData)[] = [];
    if (step === 1) fieldsToValidate = ["paymentMethod"];
    if (step === 2) fieldsToValidate = ["problemType"];
    if (step === 3) fieldsToValidate = ["merchantName", "disputedAmount", "paymentDate"];

    // Trigger validation for current step
    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        trackWizardEvent("validation_error", step, {
          ...form.getValues(),
          validationError: "required_fields",
          qualityScore: getCaseQuality(form.getValues()).score,
        });
        toast({
          title: "Fehlende Angaben",
          description: "Bitte fülle alle Pflichtfelder korrekt aus.",
          variant: "destructive",
        });
        return;
      }
    }

    // Custom validation for step 4 and 5
    const evidenceDecisionCount =
      formData.evidence.length + Object.keys(formData.evidenceStatus ?? {}).length;
    if (step === 4 && evidenceDecisionCount === 0) {
      trackWizardEvent("validation_error", step, {
        ...form.getValues(),
        validationError: "evidence_missing",
        qualityScore: getCaseQuality(form.getValues()).score,
      });
      toast({
        title: "Beweise",
        description: "Bitte ordne mindestens einen Beleg ein oder wähle bewusst 'Keine Beweise'.",
        variant: "destructive",
      });
      return;
    }

    if (step < 6) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getTurnstileToken = async (): Promise<string> => {
    if (!turnstileSiteKey) {
      if (import.meta.env.PROD) {
        throw new Error("Turnstile site key is not configured");
      }
      console.warn("Turnstile site key is not configured. Continuing in development mode.");
      return "";
    }

    await ensureTurnstileScript();

    if (!turnstileContainerRef.current || !window.turnstile) {
      throw new Error("Turnstile widget could not be initialized");
    }

    if (turnstileWidgetIdRef.current) {
      window.turnstile.remove(turnstileWidgetIdRef.current);
      turnstileWidgetIdRef.current = null;
    }

    return await new Promise<string>((resolve, reject) => {
      let settled = false;
      let timeout = 0;
      const finish = (token: string) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        if (!token) {
          reject(new Error("Turnstile returned an empty token"));
          return;
        }
        resolve(token);
      };
      const fail = (message: string) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        reject(new Error(message));
      };
      timeout = window.setTimeout(() => {
        fail("Turnstile challenge timed out");
      }, 10000);

      try {
        const widgetId = window.turnstile!.render(turnstileContainerRef.current!, {
          sitekey: turnstileSiteKey,
          size: "invisible",
          appearance: "interaction-only",
          execution: "execute",
          callback: (token: string) => finish(token || ""),
          "error-callback": () => fail("Turnstile challenge failed"),
          "expired-callback": () => fail("Turnstile challenge expired"),
        });
        turnstileWidgetIdRef.current = widgetId;
        window.turnstile!.execute(widgetId);
      } catch (error) {
        fail(error instanceof Error ? error.message : "Turnstile challenge failed");
      }
    });
  };

  const handleSubmit = async () => {
    if (createCase.isPending || isSubmittingCase) return;
    setIsSubmittingCase(true);
    let turnstileToken = "";
    try {
      turnstileToken = await getTurnstileToken();
    } catch (error) {
      console.warn("Turnstile challenge failed before API submission.", error);
      setIsSubmittingCase(false);
      toast({
        title: "Sicherheitsprüfung nicht bereit",
        description:
          "Bitte versuche es gleich erneut. Falls es weiter passiert, prüfe Browser-Erweiterungen oder lade die Seite neu. Deine Eingaben bleiben gespeichert.",
        variant: "destructive",
      });
      return;
    }
    const description = buildDescription(
      formData.structuredAnswers,
      formData.problemType,
      formData.purchaseAmount || "",
      formData.disputedAmount || "",
      formData.evidenceStatus ?? {}
    );
    const merchantResponse = buildMerchantResponse(
      formData.merchantResponseType || "",
      formData.merchantResponseNote || ""
    );
    const evidenceForSubmission = Array.from(
      new Set([
        ...(formData.evidence ?? []),
        ...Object.entries(formData.evidenceStatus ?? {})
          .filter(([, status]) => status === "have")
          .map(([id]) => id),
      ])
    ).filter((id) => id === "none" || id.trim().length > 0);
    trackWizardEvent("analysis_submit", step, {
      ...formData,
      qualityScore: getCaseQuality(formData).score,
    });
    type CreateCaseVariables = Parameters<typeof createCase.mutate>[0];
    type CreateCasePayload = CreateCaseVariables["data"] & { turnstileToken?: string };
    const casePayload: CreateCasePayload = {
      paymentMethod: formData.paymentMethod || "other",
      problemType: formData.problemType || "other",
      merchantName: formData.merchantName || "Unbekannter Händler",
      amount: Number(formData.disputedAmount) || Number(formData.purchaseAmount) || 0,
      paymentDate: formData.paymentDate || new Date().toISOString().split("T")[0],
      merchantCountry: formData.merchantCountry || undefined,
      merchantContacted: formData.merchantContacted,
      merchantResponse: merchantResponse || undefined,
      evidence: evidenceForSubmission,
      description: description || "Keine Beschreibung",
      ...(turnstileToken ? { turnstileToken } : {}),
    };
    setStep(6);
    createCase.mutate(
      {
        data: casePayload,
      },
      {
        onSuccess: (data) => {
          setIsSubmittingCase(false);
          trackWizardEvent("analysis_success", 6, {
            ...formData,
            qualityScore: getCaseQuality(formData).score,
          });
          setResult(data);
          setResultViewKey((key) => key + 1);
          if (data) {
            const newCaseId = String(data.id ?? "");
            // Restore unlock ONLY for this exact caseId (handles refresh after payment)
            const alreadyPaidForThisCase = isCaseUnlocked(newCaseId) || isFlatrateActive();
            setHasUnlocked(false);
            saveCaseSnapshot(data, formData);
            if (alreadyPaidForThisCase) {
              void unlockCaseContent(newCaseId, data.readToken, formData).catch(() => {
                setHasUnlocked(false);
              });
            }
          }
        },
        onError: (error) => {
          setIsSubmittingCase(false);
          const copy = describeCreateCaseError(error);
          toast({
            title: copy.title,
            description: copy.description,
            variant: "destructive",
          });
          setStep(5);
        },
      }
    );
  };

  const toggleEvidence = (id: string) => {
    if (id === "none") {
      setFormData((prev) => ({ ...prev, evidence: ["none"], evidenceStatus: {} }));
      return;
    }
    const filtered = formData.evidence.filter((e) => e !== "none");
    const next = filtered.includes(id) ? filtered.filter((e) => e !== id) : [...filtered, id];
    setFormData((prev) => ({
      ...prev,
      evidence: next,
      evidenceStatus: {
        ...(prev.evidenceStatus ?? {}),
        [id]: next.includes(id) ? "have" : "later",
      },
    }));
  };

  const setEvidenceStatus = (id: string, status: EvidenceStatus) => {
    setFormData((prev) => {
      const existing = new Set((prev.evidence ?? []).filter((item) => item !== "none"));
      if (status === "have") existing.add(id);
      else existing.delete(id);
      return {
        ...prev,
        evidence: Array.from(existing),
        evidenceStatus: {
          ...(prev.evidenceStatus ?? {}),
          [id]: status,
        },
      };
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} in Zwischenablage.` });
  };

  const resetForm = () => {
    clearCurrentCase();
    setStep(1);
    setResult(undefined);
    createCase.reset();
    setAcceptedLegal(false);
    setHasUnlocked(false);
    setFormData({
      paymentMethod: "",
      problemType: "",
      merchantName: "",
      purchaseAmount: "",
      disputedAmount: "",
      paymentDate: "",
      merchantCountry: "",
      merchantContacted: false,
      merchantResponseType: "",
      merchantResponseNote: "",
      evidence: [],
      evidenceStatus: {},
      structuredAnswers: {},
    });
    window.history.replaceState({}, "", "/vorlagen-generator");
  };

  const handleDownloadPdf = async () => {
    if (!result || !analysis) return;
    if (!hasUnlockedAnalysisContent(result)) {
      toast({
        title: "PDF erst nach Freischaltung",
        description: "Bitte schalte die vollständigen Textvorlagen zuerst frei.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { generatePdf } = await import("@/lib/pdf-generator");
      await generatePdf({
        merchantName: result.merchantName ?? formData.merchantName,
        amount:
          result.amount ??
          (Number(formData.disputedAmount) || Number(formData.purchaseAmount) || 0),
        paymentDate: result.paymentDate ?? formData.paymentDate,
        paymentMethod: result.paymentMethod ?? formData.paymentMethod,
        problemType: result.problemType ?? formData.problemType,
        successProbability: analysis.successProbability,
        successProbabilityLabel: analysis.successProbabilityLabel,
        summary: analysis.summary,
        nextSteps: analysis.nextSteps ?? [],
        merchantTemplate: analysis.merchantTemplate,
        bankTemplate: analysis.bankTemplate,
        escalationTemplate: analysis.escalationTemplate,
      });
      toast({
        title: "PDF wird heruntergeladen",
        description: "Datei erscheint in deinen Downloads.",
      });
    } catch {
      toast({
        title: "PDF konnte nicht erstellt werden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  const analysis = result?.analysis;
  const caseQuality = getCaseQuality(formData);
  const evidenceRecommendations = getEvidenceRecommendations(
    formData.problemType,
    formData.paymentMethod
  );
  const evidenceCounts = countEvidenceStatuses(formData);
  const hasEvidenceDecision =
    formData.evidence.length > 0 || Object.keys(formData.evidenceStatus ?? {}).length > 0;
  const paymentNextStep = getPaymentNextStep(result?.paymentMethod ?? formData.paymentMethod);

  // Step 5 validity: at least one required question answered
  const step5Valid = (() => {
    const questions = STRUCTURED_QUESTIONS[formData.problemType] ?? STRUCTURED_QUESTIONS.other;
    const required = questions.filter((q) => q.required);
    if (required.length === 0) {
      return Object.values(formData.structuredAnswers).some((v) => v.trim().length > 0);
    }
    return required.every((q) => (formData.structuredAnswers[q.id] ?? "").trim().length > 0);
  })();

  const canGoNext =
    (step === 1 && !!formData.paymentMethod) ||
    (step === 2 && !!formData.problemType) ||
    (step === 3 &&
      !!formData.merchantName &&
      !!(formData.disputedAmount || formData.purchaseAmount) &&
      !!formData.paymentDate) ||
    (step === 4 && hasEvidenceDecision);

  useEffect(() => {
    if (scrollTarget === "paywall") return;
    const active = document.activeElement as HTMLElement | null;
    const isTextEntry = !!active && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
    if (isTextEntry) return;
    const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    return () => clearTimeout(timer);
  }, [step, scrollTarget]);

  useEffect(() => {
    const pendingCaseId = (() => {
      try {
        return sessionStorage.getItem(PENDING_PAYWALL_SCROLL_KEY);
      } catch {
        return null;
      }
    })();
    const shouldScroll =
      scrollTarget === "paywall" ||
      (result?.id !== null && result?.id !== undefined && pendingCaseId === String(result.id));
    if (!shouldScroll) return;
    if (step !== 6 || !result || hasUnlocked) return;
    let attempts = 0;
    const scrollToPaywall = () => {
      attempts += 1;
      const el = paywallAnchorRef.current;
      if (el instanceof HTMLElement) {
        const y = el.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        try {
          sessionStorage.removeItem(PENDING_PAYWALL_SCROLL_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      if (attempts < 24) window.setTimeout(scrollToPaywall, 150);
    };
    const timer = window.setTimeout(scrollToPaywall, 250);
    return () => window.clearTimeout(timer);
  }, [scrollTarget, step, result, hasUnlocked, navigationKey]);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (step < 5) return;
    void ensureTurnstileScript().catch((error) => {
      console.warn("Turnstile script preload failed.", error);
    });
  }, [turnstileSiteKey, step]);

  const disputedPct = getDisputedPercent(
    formData.purchaseAmount || "",
    formData.disputedAmount || ""
  );

  return (
    <MainLayout>
      <SeoHead
        title="Kostenloser Fall-Check für Chargeback & Käuferschutz | ChargebackPilot"
        description="Starte den kostenlosen Fall-Check: Zahlungsart, Problem und Belege strukturieren und unverbindliche nächste Schritte für Chargeback, PayPal oder Klarna erhalten."
        canonical="/vorlagen-generator"
      />
      <ErrorBoundary>
        <div className={`container mx-auto py-10 px-4 ${step < 6 ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={step < 6 ? "lg:grid lg:grid-cols-[240px_1fr] lg:gap-8" : ""}>
            {/* LEFT SIDEBAR — desktop vertical stepper (steps 1-5 only) */}
            {step < 6 && (
              <aside className="hidden lg:block">
                <div className="sticky top-6">
                  <h1 className="text-2xl font-bold mb-1">Vorlagen generieren</h1>
                  <p className="text-xs text-muted-foreground mb-6">Schritt {step} von 5</p>
                  <ol className="space-y-1.5">
                    {STEP_TITLES.map((title, i) => {
                      const num = i + 1;
                      const isCurrent = num === step;
                      const isDone = num < step;
                      return (
                        <li
                          key={title}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isCurrent ? "bg-primary/10 border border-primary/20" : isDone ? "" : "opacity-60"}`}
                        >
                          <span
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
                          </span>
                          <span
                            className={`text-sm leading-tight ${isCurrent ? "font-bold text-foreground" : isDone ? "font-medium" : "text-muted-foreground"}`}
                          >
                            {title}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-6">
                    <CaseQualityPanel quality={caseQuality} compact />
                  </div>
                  <div className="mt-6 rounded-xl border bg-muted/50 p-3 text-[11px] text-muted-foreground leading-relaxed">
                    <div className="flex items-center gap-1.5 mb-1 font-semibold text-foreground">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Datenschutz transparent
                    </div>
                    Deine Angaben werden für Fallanalyse, Textgenerierung und Bereitstellung
                    genutzt.
                  </div>
                </div>
              </aside>
            )}

            {/* MAIN COLUMN */}
            <div>
              {/* Mobile compact header */}
              {step < 6 && (
                <div className="lg:hidden mb-6">
                  <h1 className="text-2xl font-bold mb-1">Vorlagen generieren</h1>
                  <p className="text-xs text-muted-foreground mb-3">
                    Schritt {step} von 5 —{" "}
                    <span className="font-semibold text-foreground">{STEP_TITLES[step - 1]}</span>
                  </p>
                  <Progress value={(step / 5) * 100} className="h-2" />
                  {step > 1 && (
                    <div className="mt-4">
                      <CaseQualityPanel quality={caseQuality} compact />
                    </div>
                  )}
                </div>
              )}

              <Card className="shadow-sm">
                <CardContent className="p-6 sm:p-8 pb-24 lg:pb-8">
                  {/* STEP 1: Payment Method */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Wie hast du bezahlt?</h2>
                        <p className="text-sm text-muted-foreground">
                          Die Zahlungsart bestimmt, welches Verfahren möglich ist.
                        </p>
                      </div>
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(val) => setFormData((p) => ({ ...p, paymentMethod: val }))}
                        className="space-y-2"
                      >
                        {PAYMENT_METHODS.map((pm) => (
                          <div
                            key={pm.id}
                            onClick={() => setFormData((p) => ({ ...p, paymentMethod: pm.id }))}
                            className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all select-none ${formData.paymentMethod === pm.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                          >
                            <RadioGroupItem
                              value={pm.id}
                              id={`pm-${pm.id}`}
                              aria-label={pm.label}
                            />
                            <span className="flex-1 font-medium">{pm.label}</span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* STEP 2: Problem Type */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Was ist das Problem?</h2>
                        <p className="text-sm text-muted-foreground">
                          Wähle den Problemtyp, der am besten zu deiner Situation passt.
                        </p>
                      </div>
                      {hasAnyPrefill && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm text-primary flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 shrink-0" />
                          <span>
                            Aus deiner vorherigen Auswahl vorausgefüllt — du kannst es jederzeit
                            anpassen.
                          </span>
                        </div>
                      )}
                      <RadioGroup
                        value={formData.problemType}
                        onValueChange={(val) => setFormData((p) => ({ ...p, problemType: val }))}
                        className="space-y-2"
                      >
                        {PROBLEM_TYPES.map((pt) => (
                          <div
                            key={pt.id}
                            onClick={() => setFormData((p) => ({ ...p, problemType: pt.id }))}
                            className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all select-none ${formData.problemType === pt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                          >
                            <RadioGroupItem
                              value={pt.id}
                              id={`pt-${pt.id}`}
                              aria-label={pt.label}
                            />
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${formData.problemType === pt.id ? "bg-primary/10" : "bg-muted"}`}
                            >
                              <pt.icon
                                className={`w-4 h-4 ${formData.problemType === pt.id ? "text-primary" : "text-muted-foreground"}`}
                              />
                            </div>
                            <span className="flex-1 font-medium">{pt.label}</span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* STEP 3: Merchant Details */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Details zum Händler</h2>
                        <p className="text-sm text-muted-foreground">
                          Diese Angaben fließen direkt in deine Textvorlagen ein.
                        </p>
                      </div>

                      {formData.problemType && (
                        <MerchantQuickSelect
                          problemType={formData.problemType}
                          selected={formData.merchantName}
                          onSelect={(name) => setFormData((p) => ({ ...p, merchantName: name }))}
                        />
                      )}

                      {/* Händlername + Datum */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="merchantName">Händlername *</Label>
                          <Input
                            id="merchantName"
                            placeholder={
                              formData.problemType === "food_delivery"
                                ? "z.B. Lieferando, Wolt, ..."
                                : formData.problemType === "flight_travel"
                                  ? "z.B. Ryanair, Booking.com, ..."
                                  : "z.B. Amazon, Zalando, ..."
                            }
                            value={formData.merchantName}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, merchantName: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="paymentDate">Zahlungsdatum *</Label>
                          <Input
                            id="paymentDate"
                            type="date"
                            value={formData.paymentDate}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, paymentDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      {/* Beträge */}
                      <div className="space-y-3">
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,12rem)]">
                          <div className="space-y-1.5">
                            <Label htmlFor="purchaseAmount">
                              Kaufbetrag gesamt (EUR)
                              <span className="text-muted-foreground font-normal ml-1 text-xs">
                                was hast du bezahlt?
                              </span>
                            </Label>
                            <Input
                              id="purchaseAmount"
                              ref={amountInputRef}
                              type="text"
                              inputMode="decimal"
                              enterKeyHint="next"
                              pattern="[0-9]*[.,]?[0-9]*"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              placeholder="0.00"
                              value={formData.purchaseAmount}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  purchaseAmount: e.target.value.replace(/[^0-9.,]/g, ""),
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  disputedInputRef.current?.focus();
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="disputedAmount">
                              Streitiger Betrag (EUR) *
                              <span className="text-muted-foreground font-normal ml-1 text-xs">
                                was willst du zurück?
                              </span>
                            </Label>
                            <Input
                              id="disputedAmount"
                              ref={disputedInputRef}
                              type="text"
                              inputMode="decimal"
                              enterKeyHint="done"
                              pattern="[0-9]*[.,]?[0-9]*"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              placeholder="0.00"
                              value={formData.disputedAmount}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  disputedAmount: e.target.value.replace(/[^0-9.,]/g, ""),
                                }))
                              }
                            />
                          </div>
                        </div>

                        {/* Percentage feedback */}
                        {formData.disputedAmount && formData.purchaseAmount && (
                          <div
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                              disputedPct === null
                                ? "bg-red-50 border-red-200 text-red-700"
                                : disputedPct === 100
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}
                          >
                            {disputedPct === null ? (
                              <>
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  Streitiger Betrag ist höher als der Kaufbetrag — bitte prüfen.
                                </span>
                              </>
                            ) : disputedPct === 100 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  Vollständige Rückerstattung — du forderst den gesamten Kaufbetrag
                                  zurück.
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  Du forderst <strong>{disputedPct}%</strong> des Kaufbetrags zurück
                                  ({formData.disputedAmount} EUR von {formData.purchaseAmount} EUR).
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {!formData.purchaseAmount && formData.disputedAmount && (
                          <p className="text-xs text-muted-foreground pl-1">
                            Kaufbetrag optional — falls du nur einen Teil zurückforderst, hilft er
                            der KI bei der Analyse.
                          </p>
                        )}
                      </div>

                      {/* Händler kontaktiert */}
                      <div className="pt-2 border-t space-y-4">
                        <div
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              merchantContacted: !p.merchantContacted,
                              merchantResponseType: "",
                              merchantResponseNote: "",
                            }))
                          }
                          className={`flex items-start space-x-3 border-2 p-4 rounded-xl cursor-pointer select-none transition-all ${formData.merchantContacted ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                        >
                          <Checkbox
                            id="contacted"
                            checked={formData.merchantContacted}
                            onCheckedChange={(c) =>
                              setFormData((p) => ({
                                ...p,
                                merchantContacted: Boolean(c),
                                merchantResponseType: "",
                                merchantResponseNote: "",
                              }))
                            }
                            className="mt-0.5"
                          />
                          <div>
                            <span className="font-medium block flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-primary inline-block" />
                              Ich habe den Händler bereits kontaktiert
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Vorheriger Kontakt stärkt deine Chargeback-Position deutlich.
                            </p>
                          </div>
                        </div>

                        {formData.merchantContacted && (
                          <div className="space-y-4 pl-1 animate-in fade-in duration-200">
                            <p className="text-sm font-semibold">
                              Was hat der Händler geantwortet?
                            </p>
                            <div className="space-y-2">
                              {MERCHANT_RESPONSE_OPTIONS.map((opt) => (
                                <div
                                  key={opt.id}
                                  onClick={() =>
                                    setFormData((p) => ({
                                      ...p,
                                      merchantResponseType: opt.id,
                                      merchantResponseNote: "",
                                    }))
                                  }
                                  className={`flex items-start gap-3 border-2 px-4 py-3 rounded-xl cursor-pointer transition-all select-none ${formData.merchantResponseType === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${formData.merchantResponseType === opt.id ? "border-primary" : "border-muted-foreground/40"}`}
                                  >
                                    {formData.merchantResponseType === opt.id && (
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold block">{opt.label}</span>
                                    <span className="text-xs text-muted-foreground">{opt.sub}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Optional note for certain responses */}
                            {["abgelehnt", "teilerstattung", "sonstiges"].includes(
                              formData.merchantResponseType || ""
                            ) && (
                              <div className="space-y-1.5 animate-in fade-in duration-150">
                                <Label htmlFor="responseNote" className="text-sm">
                                  {formData.merchantResponseType === "teilerstattung"
                                    ? "Bedingungen oder Begründung (optional)"
                                    : "Weitere Details (optional)"}
                                </Label>
                                <Textarea
                                  id="responseNote"
                                  rows={2}
                                  placeholder={
                                    formData.merchantResponseType === "teilerstattung"
                                      ? "z.B. nur als Gutschein, Annahmefrist bis ..., Bedingungen ..."
                                      : "z.B. Händler verwies auf AGB, Begründung war..."
                                  }
                                  value={formData.merchantResponseNote}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      merchantResponseNote: e.target.value,
                                    }))
                                  }
                                  className="resize-none text-sm"
                                />
                                {formData.merchantResponseType === "teilerstattung" &&
                                  formData.purchaseAmount &&
                                  formData.disputedAmount &&
                                  parseFloat(formData.purchaseAmount) >
                                    parseFloat(formData.disputedAmount) && (
                                    <p className="text-xs text-muted-foreground pl-0.5">
                                      Angebot abgeleitet aus deinen Beträgen:{" "}
                                      <strong>
                                        {(
                                          parseFloat(formData.purchaseAmount) -
                                          parseFloat(formData.disputedAmount)
                                        ).toFixed(2)}{" "}
                                        EUR
                                      </strong>{" "}
                                      bereits angeboten · noch offen:{" "}
                                      <strong>
                                        {parseFloat(formData.disputedAmount).toFixed(2)} EUR
                                      </strong>
                                      .
                                    </p>
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Evidence */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Welche Beweise hast du?</h2>
                        <p className="text-sm text-muted-foreground">
                          Wähle alle Belege aus, die du hast — oder markiere bewusst, dass aktuell
                          keine Belege vorliegen.
                        </p>
                      </div>

                      <EvidenceCoach
                        recommendations={evidenceRecommendations}
                        evidenceStatus={formData.evidenceStatus ?? {}}
                        selectedEvidence={formData.evidence}
                        onSetStatus={setEvidenceStatus}
                      />

                      {EVIDENCE_GROUPS.map((group) => {
                        const GroupIcon = group.icon;
                        return (
                          <div key={group.label} className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <GroupIcon className="w-3.5 h-3.5" />
                              {group.label}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {group.items.map((ev) => {
                                const checked = formData.evidence.includes(ev.id);
                                return (
                                  <div
                                    key={ev.id}
                                    onClick={() => toggleEvidence(ev.id)}
                                    className={`flex items-start space-x-3 border-2 p-3.5 rounded-xl cursor-pointer select-none transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                                  >
                                    <Checkbox
                                      id={`ev-${ev.id}`}
                                      checked={checked}
                                      onCheckedChange={() => toggleEvidence(ev.id)}
                                      className="mt-0.5 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-medium text-sm block">{ev.label}</span>
                                      {ev.hint && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {ev.hint}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {formData.evidence.filter((e) => e !== "none").length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          {formData.evidence.filter((e) => e !== "none").length} Beweis
                          {formData.evidence.filter((e) => e !== "none").length !== 1
                            ? "e"
                            : ""}{" "}
                          ausgewählt — die spätere Formulierung kann dadurch konkreter werden.
                        </div>
                      )}
                      {evidenceCounts.later > 0 && (
                        <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          {evidenceCounts.later} Beleg
                          {evidenceCounts.later !== 1 ? "e" : ""} als „hole ich” markiert — der Fall
                          bleibt startklar, aber du bekommst eine klarere Checkliste.
                        </div>
                      )}
                      {formData.evidence.includes("none") && (
                        <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          Keine Belege ausgewählt — die Analyse bleibt möglich, kann aber
                          allgemeiner ausfallen.
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5: Structured case questions */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">Was ist passiert?</h2>
                        <p className="text-sm text-muted-foreground">
                          Beantworte die folgenden Fragen — so braucht die KI alle Details für
                          präzise Vorlagen.
                        </p>
                      </div>

                      <div className="space-y-5">
                        {(
                          STRUCTURED_QUESTIONS[formData.problemType] ?? STRUCTURED_QUESTIONS.other
                        ).map((q) => (
                          <div key={q.id} className="space-y-2">
                            <Label className="text-sm font-semibold">
                              {q.label}
                              {q.required && <span className="text-primary ml-1">*</span>}
                            </Label>
                            <QuestionField
                              question={q}
                              value={formData.structuredAnswers[q.id] ?? ""}
                              onChange={(val) => setAnswer(q.id, val)}
                            />
                          </div>
                        ))}
                      </div>

                      <CaseQualityPanel quality={caseQuality} />

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> KI-Generierung
                        </p>
                        <p>
                          Deine Angaben werden von unserer KI strukturiert und in passende Vorlagen
                          überführt. Diese Zustimmung ist erforderlich, damit die Analyse gestartet
                          werden kann. Dauer: ca. 15–30 Sekunden.
                        </p>
                      </div>

                      <div className="border border-border rounded-xl p-4 space-y-3">
                        <div ref={turnstileContainerRef} className="sr-only" aria-hidden="true" />
                        <label
                          htmlFor="legal-accept"
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          <Checkbox
                            id="legal-accept"
                            checked={acceptedLegal}
                            onCheckedChange={(c) => setAcceptedLegal(Boolean(c))}
                            className="mt-1"
                          />
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            Ich stimme zu, dass meine eingegebenen Daten zur Texterstellung an eine
                            Künstliche Intelligenz über die Gemini API von Google LLC (USA)
                            übertragen werden. Ich habe verstanden, dass ChargebackPilot{" "}
                            <strong>keine Rechtsberatung</strong> ist, keine Fristen überwacht und
                            keine anwaltliche Prüfung ersetzt. Ich akzeptiere die{" "}
                            <a
                              href="/agb"
                              target="_blank"
                              className="underline hover:text-foreground"
                            >
                              AGB
                            </a>{" "}
                            und{" "}
                            <a
                              href="/datenschutz"
                              target="_blank"
                              className="underline hover:text-foreground"
                            >
                              Datenschutzerklärung
                            </a>
                            .
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Loading + Result */}
                  {step === 6 && (
                    <div className="space-y-8">
                      {!result ? (
                        <GeneratorLoader merchantName={formData.merchantName} />
                      ) : (
                        <div
                          key={resultViewKey}
                          className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                          {/* Header */}
                          <div className="text-center pb-2">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
                              <TrendingUp className="w-7 h-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">Deine Vorlagen</h2>
                            {result.merchantName && (
                              <p className="text-muted-foreground text-sm mt-1">
                                Fall gegen <strong>{result.merchantName}</strong> —{" "}
                                {new Date().toLocaleDateString("de-DE")}
                              </p>
                            )}
                          </div>

                          {/* Strategy indicator — qualitative, no raw percentage */}
                          {analysis && (
                            <StrategyIndicator label={analysis.successProbabilityLabel} />
                          )}

                          <ActionPlanPanel
                            merchantName={result.merchantName ?? formData.merchantName}
                            hasMerchantContacted={Boolean(
                              result.merchantContacted ?? formData.merchantContacted
                            )}
                            missingEvidenceCount={analysis?.missingEvidence?.length ?? 0}
                            paymentNextStep={paymentNextStep}
                            hasUnlocked={hasUnlocked}
                          />

                          {/* Urgency banners */}
                          {analysis?.urgencyLevel === "hoch" && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
                              <Siren className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Dringlich — Frist beachten!</p>
                                <p>{analysis.deadline}</p>
                              </div>
                            </div>
                          )}
                          {analysis?.urgencyLevel === "mittel" && (
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                              <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Fristhinweis</p>
                                <p>{analysis.deadline}</p>
                              </div>
                            </div>
                          )}

                          {/* Summary + reasoning — always visible */}
                          {analysis && (
                            <div className="space-y-3">
                              <div className="border rounded-xl p-5">
                                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Fallzusammenfassung
                                </h3>
                                <p className="text-sm leading-relaxed">{analysis.summary}</p>
                              </div>
                              <div className="border rounded-xl p-5">
                                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-primary" />
                                  Begründung
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {analysis.reasoning}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Missing evidence — always visible */}
                          {analysis?.missingEvidence && analysis.missingEvidence.length > 0 && (
                            <div className="border rounded-xl p-5">
                              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Fehlende Beweise — jetzt sichern
                              </h3>
                              <ul className="space-y-2">
                                {analysis.missingEvidence.map((ev, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>{ev}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* First next step — free preview */}
                          {analysis?.nextSteps && analysis.nextSteps.length > 0 && (
                            <div className="border rounded-xl p-5">
                              <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-primary" />
                                Nächste Schritte
                              </h3>
                              <ol className="space-y-3">
                                <li className="flex gap-3 text-sm">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                    1
                                  </span>
                                  <span className="leading-relaxed pt-0.5">
                                    {analysis.nextSteps[0]}
                                  </span>
                                </li>
                                {!hasUnlocked && analysis.nextSteps.length > 1 && (
                                  <li
                                    className="flex gap-3 text-sm select-none"
                                    aria-label="Nächster Schritt gesperrt"
                                  >
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                      2
                                    </span>
                                    <span className="leading-relaxed pt-0.5 flex-1 min-w-0">
                                      <span
                                        className="block h-3.5 rounded bg-muted mb-1.5"
                                        style={{ filter: "blur(2.5px)", width: "92%" }}
                                      />
                                      <span
                                        className="block h-3.5 rounded bg-muted"
                                        style={{ filter: "blur(2.5px)", width: "78%" }}
                                      />
                                    </span>
                                  </li>
                                )}
                                {hasUnlocked &&
                                  analysis.nextSteps.slice(1).map((s, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                        {i + 2}
                                      </span>
                                      <span className="leading-relaxed pt-0.5">{s}</span>
                                    </li>
                                  ))}
                              </ol>
                            </div>
                          )}

                          {/* ===== PAYWALL or UNLOCKED CONTENT ===== */}
                          {!hasUnlocked ? (
                            <>
                              {/* Blurred teaser stack — drives FOMO before paywall */}
                              <div className="space-y-3">
                                <LockedTeaser
                                  icon={<Scale className="w-4 h-4 text-primary" />}
                                  title="Verfahrensbezogene Hinweise"
                                  lines={3}
                                />
                                <LockedTeaser
                                  icon={<Shield className="w-4 h-4 text-primary" />}
                                  title="Mögliche Einwände beantworten"
                                  lines={4}
                                />
                                <LockedTeaser
                                  icon={<Building2 className="w-4 h-4 text-primary" />}
                                  title="Anschreiben an den Händler"
                                  lines={6}
                                />
                                <LockedTeaser
                                  icon={<Landmark className="w-4 h-4 text-primary" />}
                                  title="Chargeback-Antrag an Bank / PayPal / Klarna"
                                  lines={6}
                                />
                                <LockedTeaser
                                  icon={<Siren className="w-4 h-4 text-primary" />}
                                  title="Eskalationsschreiben"
                                  lines={5}
                                />
                                <LockedTeaser
                                  icon={<FileSignature className="w-4 h-4 text-primary" />}
                                  title="Druckfertige DIN-5008-Briefe als PDF"
                                  lines={3}
                                />
                              </div>
                              <div ref={paywallAnchorRef} data-testid="paywall-anchor">
                                <PaywallModal
                                  caseId={result.id}
                                  merchantName={result.merchantName ?? formData.merchantName}
                                  amount={
                                    result.amount ??
                                    (Number(formData.disputedAmount) ||
                                      Number(formData.purchaseAmount) ||
                                      0)
                                  }
                                  strategyLabel={analysis?.successProbabilityLabel ?? ""}
                                  paymentMethod={result.paymentMethod ?? formData.paymentMethod}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6 animate-in fade-in duration-500">
                              {/* Unlocked badge */}
                              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
                                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  Vollständige Analyse freigeschaltet
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                                  onClick={handleDownloadPdf}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  PDF speichern
                                </Button>
                              </div>

                              {/* PayPal step-by-step guide */}
                              {(result.paymentMethod === "paypal" ||
                                formData.paymentMethod === "paypal") && (
                                <PaypalGuide
                                  problemType={result.problemType ?? formData.problemType}
                                  merchantName={result.merchantName ?? formData.merchantName}
                                  amount={result.amount ?? (Number(formData.disputedAmount) || 0)}
                                />
                              )}

                              {/* Recommended category */}
                              {analysis?.recommendedCategory && (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                                      Mögliche Streitkategorie
                                    </p>
                                    <p className="font-bold text-sm">
                                      {analysis.recommendedCategory}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Legal basis */}
                              {analysis?.legalBasis && analysis.legalBasis.length > 0 && (
                                <div className="border rounded-xl p-5">
                                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-primary" />
                                    Verfahrensbezogene Hinweise
                                  </h3>
                                  <ul className="space-y-2">
                                    {analysis.legalBasis.map((basis, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span>{basis}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Counterarguments */}
                              {analysis?.counterarguments &&
                                analysis.counterarguments.length > 0 && (
                                  <div className="border rounded-xl p-5">
                                    <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-primary" />
                                      Mögliche Einwände — sachlich beantworten
                                    </h3>
                                    <ul className="space-y-3">
                                      {analysis.counterarguments.map((arg, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-sm bg-muted/50 border rounded-lg px-3 py-2.5"
                                        >
                                          <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                          <span>{arg}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {/* Templates */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                  <h3 className="text-lg font-bold">
                                    Deine strukturierten Textvorlagen
                                  </h3>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 cursor-pointer"
                                    onClick={handleDownloadPdf}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Alle als PDF
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Für {result.merchantName || "deinen Fall"} erstellt — bitte vor
                                  dem Versenden prüfen und ggf. anpassen.
                                </p>
                                {analysis?.merchantTemplate && (
                                  <div className="space-y-3">
                                    <CopyableTemplate
                                      title="Anschreiben an den Händler"
                                      icon={<Building2 className="w-4 h-4" />}
                                      text={analysis.merchantTemplate}
                                      onCopy={() =>
                                        copyToClipboard(
                                          analysis.merchantTemplate,
                                          "Händler-Vorlage"
                                        )
                                      }
                                    />
                                    <LetterGenerator
                                      variant="merchant"
                                      recipientCompany={
                                        result.merchantName ??
                                        formData.merchantName ??
                                        "Unbekannter Händler"
                                      }
                                      amount={
                                        result.amount ??
                                        (Number(formData.disputedAmount) ||
                                          Number(formData.purchaseAmount) ||
                                          0)
                                      }
                                      paymentDate={result.paymentDate ?? formData.paymentDate}
                                      defaultSubject={extractSubject(
                                        analysis.merchantTemplate,
                                        `Formelle Reklamation — ${result.merchantName ?? "Händler"}`
                                      )}
                                      defaultBody={extractBody(analysis.merchantTemplate)}
                                    />
                                  </div>
                                )}
                                {analysis?.bankTemplate && (
                                  <div className="space-y-3">
                                    <CopyableTemplate
                                      title="Chargeback-Antrag an Bank / PayPal / Klarna"
                                      icon={<Landmark className="w-4 h-4" />}
                                      text={analysis.bankTemplate}
                                      onCopy={() =>
                                        copyToClipboard(analysis.bankTemplate, "Bank-Vorlage")
                                      }
                                    />
                                    <LetterGenerator
                                      variant="bank"
                                      recipientCompany="Meine Bank / Zahlungsdienstleister"
                                      amount={
                                        result.amount ??
                                        (Number(formData.disputedAmount) ||
                                          Number(formData.purchaseAmount) ||
                                          0)
                                      }
                                      paymentDate={result.paymentDate ?? formData.paymentDate}
                                      defaultSubject={extractSubject(
                                        analysis.bankTemplate,
                                        `Antrag auf Chargeback — ${result.merchantName ?? "Händler"}`
                                      )}
                                      defaultBody={extractBody(analysis.bankTemplate)}
                                    />
                                  </div>
                                )}
                                {analysis?.escalationTemplate && (
                                  <div className="space-y-3">
                                    <CopyableTemplate
                                      title="Eskalationsschreiben (falls erster Versuch erfolglos)"
                                      icon={<Siren className="w-4 h-4" />}
                                      text={analysis.escalationTemplate}
                                      onCopy={() =>
                                        copyToClipboard(
                                          analysis.escalationTemplate,
                                          "Eskalations-Vorlage"
                                        )
                                      }
                                    />
                                    <LetterGenerator
                                      variant="escalation"
                                      recipientCompany="Schlichtungsstelle / Verbraucherzentrale"
                                      amount={
                                        result.amount ??
                                        (Number(formData.disputedAmount) ||
                                          Number(formData.purchaseAmount) ||
                                          0)
                                      }
                                      paymentDate={result.paymentDate ?? formData.paymentDate}
                                      defaultSubject={extractSubject(
                                        analysis.escalationTemplate,
                                        `Eskalation — Ungelöster Streitfall`
                                      )}
                                      defaultBody={extractBody(analysis.escalationTemplate)}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* PDF download CTA */}
                              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
                                <div className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                  Fertig
                                </div>
                                <h3 className="font-bold text-lg">Alles als PDF herunterladen</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                  Alle 3 Textvorlagen, deine Fall-Strukturierung und nächsten
                                  Schritte in einem druckfertigen Dokument.
                                </p>
                                <Button
                                  className="gap-2 cursor-pointer shadow-sm"
                                  onClick={handleDownloadPdf}
                                >
                                  <Download className="w-4 h-4" />
                                  PDF herunterladen
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Disclaimer — always shown */}
                          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
                            <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Wichtiger Haftungsausschluss
                            </h4>
                            <div className="text-sm text-red-900 leading-relaxed">
                              {analysis?.disclaimer} Nutzer sind selbst verantwortlich, die
                              Richtigkeit der Vorlagen und die Einhaltung sämtlicher Fristen zu
                              prüfen. Sende diese Texte niemals ungeprüft ab.
                            </div>
                          </div>

                          <div className="text-center border-t pt-6">
                            <Button
                              variant="outline"
                              onClick={resetForm}
                              className="cursor-pointer"
                            >
                              Neuen Fall generieren
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* NAV BUTTONS */}
                  {step < 6 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-t lg:p-0 lg:mt-8 lg:pt-6 z-40 flex justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:shadow-none">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="gap-2 cursor-pointer shadow-sm lg:shadow-none bg-background"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                      </Button>
                      {step < 5 ? (
                        <Button
                          onClick={handleNext}
                          disabled={!canGoNext}
                          className="gap-2 cursor-pointer shadow-sm lg:shadow-none"
                        >
                          Weiter
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            !step5Valid ||
                            !acceptedLegal ||
                            createCase.isPending ||
                            isSubmittingCase
                          }
                          className="gap-2 cursor-pointer shadow-sm lg:shadow-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          {createCase.isPending || isSubmittingCase ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          {createCase.isPending || isSubmittingCase
                            ? "Generiere..."
                            : "Vorlagen kostenlos generieren"}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}
