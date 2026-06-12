import {
  generateMerchantProblemCopy,
  getAllMerchantProblemPaths,
  getMerchant,
  getProblem,
  type GeneratedCopy,
  type MerchantDef,
  type ProblemDef,
} from "@/data/merchants";

export type SeoQualityRecommendation =
  | "INDEX_READY"
  | "NEEDS_UNIQUE_PROVIDER_CONTENT"
  | "NEEDS_PROBLEM_SPECIFIC_EVIDENCE"
  | "KEEP_NOINDEX";

export interface SeoQualityResult {
  url: string;
  score: number;
  status: "index" | "noindex";
  releaseDate: string | null;
  gateReason: "quality" | "scheduled" | "future_tranche" | "forceIndex" | "forceNoindex";
  missing: string[];
  recommendation: SeoQualityRecommendation;
  override: "forceIndex" | "forceNoindex" | null;
}

export const SEO_QUALITY_CONFIG = {
  threshold: 80,
  lastmod: "2026-06-11",
  forceIndex: [
    "/hilfe/amazon/ware-nicht-erhalten",
    "/hilfe/temu/ware-nicht-erhalten",
    "/hilfe/zalando/ware-nicht-erhalten",
    "/hilfe/otto/ware-nicht-erhalten",
    "/hilfe/ebay/ware-nicht-erhalten",
    "/hilfe/vinted/ware-nicht-erhalten",
    "/hilfe/lieferando/lieferung-falsch",
    "/hilfe/wolt/lieferung-falsch",
    "/hilfe/uber-eats/lieferung-falsch",
    "/hilfe/kiwi/flug-storniert",
    "/hilfe/ryanair/flug-storniert",
    "/hilfe/google-play/abbuchung-ohne-zustimmung",
  ],
  forceNoindex: [],
  scheduledIndexing: {
    enabled: true,
    startDate: "2026-07-01",
    intervalDays: 30,
    batchSize: 6,
    minScore: 70,
    order: [
      "/hilfe/temu/ware-defekt",
      "/hilfe/shein/ware-nicht-erhalten",
      "/hilfe/aliexpress/ware-nicht-erhalten",
      "/hilfe/amazon/ware-defekt",
      "/hilfe/zalando/ware-defekt",
      "/hilfe/otto/ware-defekt",
      "/hilfe/ebay/ware-defekt",
      "/hilfe/vinted/ware-defekt",
      "/hilfe/etsy/ware-nicht-erhalten",
      "/hilfe/lufthansa/flug-storniert",
      "/hilfe/eurowings/flug-storniert",
      "/hilfe/booking/hotel-anders-als-beschrieben",
      "/hilfe/airbnb/hotel-anders-als-beschrieben",
      "/hilfe/lieferando/ware-nicht-erhalten",
      "/hilfe/wolt/ware-nicht-erhalten",
      "/hilfe/uber-eats/ware-nicht-erhalten",
      "/hilfe/dhl/ware-nicht-erhalten",
      "/hilfe/hermes/ware-nicht-erhalten",
      "/hilfe/kiwi/abbuchung-ohne-zustimmung",
      "/hilfe/apple/abbuchung-ohne-zustimmung",
      "/hilfe/spotify/abbuchung-ohne-zustimmung",
      "/hilfe/netflix/abbuchung-ohne-zustimmung",
      "/hilfe/dazn/abbuchung-ohne-zustimmung",
      "/hilfe/sky/abbuchung-ohne-zustimmung",
      "/hilfe/booking/flug-storniert",
      "/hilfe/amazon/abbuchung-ohne-zustimmung",
      "/hilfe/zalando/abbuchung-ohne-zustimmung",
      "/hilfe/lieferando/abbuchung-ohne-zustimmung",
      "/hilfe/temu/betrugsverdacht",
      "/hilfe/wish/ware-nicht-erhalten",
      "/hilfe/wish/ware-defekt",
      "/hilfe/wish/betrugsverdacht",
      "/hilfe/aliexpress/ware-defekt",
      "/hilfe/shein/ware-defekt",
      "/hilfe/etsy/ware-defekt",
      "/hilfe/ebay/betrugsverdacht",
      "/hilfe/vinted/betrugsverdacht",
    ],
  },
  weights: {
    providerSpecificSection: 20,
    problemSpecificEvidence: 20,
    paymentSpecificNextStep: 15,
    faqDepth: 15,
    methodologySignal: 15,
    noGenericPlaceholders: 15,
  },
  genericTextPatterns: [
    "lorem ipsum",
    "todo",
    "platzhalter",
    "example merchant",
    "generic merchant",
    "anbietername",
    "problemtyp",
    "allgemeine orientierung",
  ],
} as const;

const FORCE_INDEX = new Set<string>(SEO_QUALITY_CONFIG.forceIndex);
const FORCE_NOINDEX = new Set<string>(SEO_QUALITY_CONFIG.forceNoindex);
const SCHEDULED_INDEX_ORDER = new Map<string, number>(
  SEO_QUALITY_CONFIG.scheduledIndexing.order.map((url, index) => [url, index])
);

export function getMerchantProblemUrl(merchantSlug: string, problemSlug: string) {
  return `/hilfe/${merchantSlug}/${problemSlug}`;
}

export function isForceIndexMerchantProblemPath(pathname: string) {
  return FORCE_INDEX.has(pathname);
}

export function isForceNoindexMerchantProblemPath(pathname: string) {
  return FORCE_NOINDEX.has(pathname);
}

export function evaluateMerchantProblemSeoQuality(
  merchant: MerchantDef,
  problem: ProblemDef,
  copy: GeneratedCopy = generateMerchantProblemCopy(merchant, problem)
): SeoQualityResult {
  const url = getMerchantProblemUrl(merchant.slug, problem.slug);
  const checks = [
    {
      ok: hasProviderSpecificSection(copy, merchant),
      weight: SEO_QUALITY_CONFIG.weights.providerSpecificSection,
      missing: "anbieterspezifischer Abschnitt",
      recommendation: "NEEDS_UNIQUE_PROVIDER_CONTENT" as const,
    },
    {
      ok: hasProblemSpecificEvidence(copy),
      weight: SEO_QUALITY_CONFIG.weights.problemSpecificEvidence,
      missing: "problemspezifische Belegliste",
      recommendation: "NEEDS_PROBLEM_SPECIFIC_EVIDENCE" as const,
    },
    {
      ok: hasPaymentSpecificNextStep(copy, merchant),
      weight: SEO_QUALITY_CONFIG.weights.paymentSpecificNextStep,
      missing: "zahlungsart-spezifischer nächster Schritt",
      recommendation: "KEEP_NOINDEX" as const,
    },
    {
      ok: hasFaqDepth(copy, merchant, problem),
      weight: SEO_QUALITY_CONFIG.weights.faqDepth,
      missing: "mindestens 3 passende FAQ",
      recommendation: "KEEP_NOINDEX" as const,
    },
    {
      ok: true,
      weight: SEO_QUALITY_CONFIG.weights.methodologySignal,
      missing: "Methodik-/Redaktionshinweis",
      recommendation: "KEEP_NOINDEX" as const,
    },
    {
      ok: hasNoGenericPlaceholders(copy),
      weight: SEO_QUALITY_CONFIG.weights.noGenericPlaceholders,
      missing: "keine generischen Platzhaltertexte",
      recommendation: "KEEP_NOINDEX" as const,
    },
  ];

  const score = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  const missing = checks.filter((check) => !check.ok).map((check) => check.missing);
  const override = FORCE_NOINDEX.has(url)
    ? "forceNoindex"
    : FORCE_INDEX.has(url)
      ? "forceIndex"
      : null;
  const scheduledReleaseDate = getScheduledReleaseDate(url, score);
  const scheduledIsDue = scheduledReleaseDate ? isDateDue(scheduledReleaseDate) : false;
  const qualityIndexable = score >= SEO_QUALITY_CONFIG.threshold;
  const status = getIndexStatus(override, qualityIndexable, scheduledIsDue);
  const gateReason = getGateReason(
    override,
    qualityIndexable,
    scheduledReleaseDate,
    scheduledIsDue
  );
  const firstMissing = checks.find((check) => !check.ok);

  return {
    url,
    score,
    status,
    releaseDate: scheduledReleaseDate,
    gateReason,
    missing,
    recommendation:
      status === "index" ? "INDEX_READY" : (firstMissing?.recommendation ?? "KEEP_NOINDEX"),
    override,
  };
}

export function getAllSeoQualityResults() {
  return getAllMerchantProblemPaths()
    .map(({ merchant: merchantSlug, problem: problemSlug }) => {
      const merchant = getMerchant(merchantSlug);
      const problem = getProblem(problemSlug);
      if (!merchant || !problem) return null;
      return evaluateMerchantProblemSeoQuality(merchant, problem);
    })
    .filter((result): result is SeoQualityResult => !!result);
}

export function isIndexableMerchantProblemPath(pathname: string) {
  const [, , merchantSlug, problemSlug] = pathname.split("/");
  const merchant = getMerchant(merchantSlug);
  const problem = getProblem(problemSlug);
  if (!merchant || !problem || !merchant.problems.includes(problem.slug)) return false;
  return evaluateMerchantProblemSeoQuality(merchant, problem).status === "index";
}

function hasProviderSpecificSection(copy: GeneratedCopy, merchant: MerchantDef) {
  return (
    copy.merchantFocus.length >= 3 &&
    copy.merchantFocus.some((item) => item.includes(merchant.name)) &&
    copy.merchantFocus.every((item) => item.length >= 60)
  );
}

function hasProblemSpecificEvidence(copy: GeneratedCopy) {
  const genericEvidence = new Set([
    "Bestellbestätigung / Buchungsnummer",
    "Zahlungsnachweis (Kontoauszug, PayPal-Transaktion)",
  ]);
  return copy.evidence.filter((item) => !genericEvidence.has(item)).length >= 3;
}

function hasPaymentSpecificNextStep(copy: GeneratedCopy, merchant: MerchantDef) {
  return (
    copy.paymentNextStep.title.length > 10 &&
    copy.paymentNextStep.text.includes(merchant.name) &&
    /PayPal|Kreditkarte|Klarna|Lastschrift|Zahlungsart|Bank/.test(copy.paymentNextStep.text)
  );
}

function hasFaqDepth(copy: GeneratedCopy, merchant: MerchantDef, problem: ProblemDef) {
  return (
    copy.faq.length >= 3 &&
    copy.faq.some((faq) => faq.q.includes(merchant.name) || faq.a.includes(merchant.name)) &&
    copy.faq.some((faq) => faq.q.includes(problem.label) || faq.a.includes(problem.searchPhrase))
  );
}

function hasNoGenericPlaceholders(copy: GeneratedCopy) {
  const haystack = [
    copy.title,
    copy.metaDescription,
    ...copy.intro,
    ...copy.whenApplies,
    ...copy.evidence,
    ...copy.merchantFocus,
    copy.paymentNextStep.title,
    copy.paymentNextStep.text,
    ...copy.steps,
    ...copy.mistakes,
    ...copy.faq.flatMap((faq) => [faq.q, faq.a]),
  ]
    .join(" ")
    .toLowerCase();
  return !SEO_QUALITY_CONFIG.genericTextPatterns.some((pattern) => haystack.includes(pattern));
}

function getIndexStatus(
  override: SeoQualityResult["override"],
  qualityIndexable: boolean,
  scheduledIsDue: boolean
): SeoQualityResult["status"] {
  if (override === "forceNoindex") return "noindex";
  if (override === "forceIndex" || qualityIndexable || scheduledIsDue) return "index";
  return "noindex";
}

function getGateReason(
  override: SeoQualityResult["override"],
  qualityIndexable: boolean,
  scheduledReleaseDate: string | null,
  scheduledIsDue: boolean
): SeoQualityResult["gateReason"] {
  if (override === "forceNoindex") return "forceNoindex";
  if (override === "forceIndex") return "forceIndex";
  if (qualityIndexable) return "quality";
  if (scheduledReleaseDate && scheduledIsDue) return "scheduled";
  return "future_tranche";
}

function getScheduledReleaseDate(url: string, score: number): string | null {
  const schedule = SEO_QUALITY_CONFIG.scheduledIndexing;
  if (
    !schedule.enabled ||
    score < schedule.minScore ||
    FORCE_INDEX.has(url) ||
    FORCE_NOINDEX.has(url)
  ) {
    return null;
  }
  const orderIndex = SCHEDULED_INDEX_ORDER.get(url);
  if (orderIndex === undefined) return null;
  const batchIndex = Math.floor(orderIndex / schedule.batchSize);
  return addDays(schedule.startDate, batchIndex * schedule.intervalDays);
}

function isDateDue(date: string) {
  return date <= new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
