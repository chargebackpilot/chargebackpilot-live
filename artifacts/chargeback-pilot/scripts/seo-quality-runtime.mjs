import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

export async function loadSeoQualityRuntime(root, providedConfig) {
  const merchantSource = await fs.readFile(path.join(root, "src", "data", "merchants.ts"), "utf-8");
  const config =
    providedConfig ??
    JSON.parse(
      await fs.readFile(path.join(root, "src", "seo-quality-config.json"), "utf-8"),
    );
  const transpiled = ts.transpileModule(merchantSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      removeComments: true,
    },
    fileName: "merchants.ts",
  }).outputText;
  const merchantModule = await import(
    `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`
  );

  const merchants = merchantModule.MERCHANTS;
  const problems = merchantModule.PROBLEMS;
  const generateCopy = merchantModule.generateMerchantProblemCopy;
  const getMerchantIndexSeo = merchantModule.getMerchantIndexSeo;
  const merchantsBySlug = new Map(merchants.map((merchant) => [merchant.slug, merchant]));
  const problemsBySlug = new Map(problems.map((problem) => [problem.slug, problem]));
  const forceIndex = new Set(config.forceIndex ?? []);
  const forceNoindex = new Set(config.forceNoindex ?? []);
  const threshold = Number(config.threshold ?? 80);
  const schedule = config.scheduledIndexing ?? {
    enabled: false,
    startDate: "2099-01-01",
    intervalDays: 30,
    batchSize: 6,
    minScore: threshold,
    order: [],
  };
  const scheduleOrder = new Map(schedule.order.map((url, index) => [url, index]));
  const today = process.env.SEO_RELEASE_DATE ?? new Date().toISOString().slice(0, 10);

  function evaluate(merchant, problem) {
    const url = `/hilfe/${merchant.slug}/${problem.slug}`;
    const copy = generateCopy(merchant, problem);
    const checks = [
      {
        ok:
          copy.merchantFocus.length >= 3 &&
          copy.merchantFocus.some((item) => item.includes(merchant.name)) &&
          copy.merchantFocus.some((item) => item.includes(merchant.description)) &&
          copy.merchantFocus.every((item) => item.length >= 60),
        weight: config.weights.providerSpecificSection,
        missing: "anbieterspezifischer Abschnitt",
        recommendation: "NEEDS_UNIQUE_PROVIDER_CONTENT",
      },
      {
        ok:
          copy.evidence.filter(
            (item) =>
              item !== "Bestellbestätigung / Buchungsnummer" &&
              item !== "Zahlungsnachweis (Kontoauszug, PayPal-Transaktion)",
          ).length >= 3,
        weight: config.weights.problemSpecificEvidence,
        missing: "problemspezifische Belegliste",
        recommendation: "NEEDS_PROBLEM_SPECIFIC_EVIDENCE",
      },
      {
        ok:
          copy.paymentNextStep.title.length > 10 &&
          copy.paymentNextStep.text.includes(merchant.name) &&
          /PayPal|Kreditkarte|Klarna|Lastschrift|Zahlungsart|Bank/.test(
            copy.paymentNextStep.text,
          ),
        weight: config.weights.paymentSpecificNextStep,
        missing: "zahlungsart-spezifischer nächster Schritt",
        recommendation: "KEEP_NOINDEX",
      },
      {
        ok:
          copy.faq.length >= 3 &&
          copy.faq.some(
            (faq) => faq.q.includes(merchant.name) || faq.a.includes(merchant.name),
          ) &&
          copy.faq.some(
            (faq) =>
              faq.q.includes(problem.label) ||
              faq.a.includes(problem.searchPhrase) ||
              faq.q.includes(copy.displayLabel) ||
              faq.a.includes(copy.searchPhrase),
          ),
        weight: config.weights.faqDepth,
        missing: "mindestens 3 passende FAQ",
        recommendation: "KEEP_NOINDEX",
      },
      {
        ok: true,
        weight: config.weights.methodologySignal,
        missing: "Methodik-/Redaktionshinweis",
        recommendation: "KEEP_NOINDEX",
      },
      {
        ok: hasNoGenericPlaceholders(copy, config.genericTextPatterns ?? []),
        weight: config.weights.noGenericPlaceholders,
        missing: "keine generischen Platzhaltertexte",
        recommendation: "KEEP_NOINDEX",
      },
    ];
    const score = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
    const missing = checks.filter((check) => !check.ok).map((check) => check.missing);
    const override = forceNoindex.has(url)
      ? "forceNoindex"
      : forceIndex.has(url)
        ? "forceIndex"
        : null;
    const releaseDate = getScheduledReleaseDate(url, score);
    const scheduledIsDue = Boolean(releaseDate && releaseDate <= today);
    const qualityIndexable = score >= threshold;
    const status =
      override === "forceNoindex"
        ? "noindex"
        : override === "forceIndex"
          ? "index"
          : releaseDate
            ? qualityIndexable && scheduledIsDue
              ? "index"
              : "noindex"
            : qualityIndexable
              ? "index"
              : "noindex";
    const gateReason =
      override ??
      (releaseDate
        ? scheduledIsDue
          ? "scheduled"
          : "future_tranche"
        : qualityIndexable
          ? "quality"
          : "quality_missing");
    const firstMissing = checks.find((check) => !check.ok);

    return {
      url,
      score,
      status,
      releaseDate,
      gateReason,
      missing,
      recommendation:
        status === "index" || missing.length === 0
          ? "INDEX_READY"
          : (firstMissing?.recommendation ?? "KEEP_NOINDEX"),
      override,
    };
  }

  function getScheduledReleaseDate(url, score) {
    if (
      !schedule.enabled ||
      score < schedule.minScore ||
      forceIndex.has(url) ||
      forceNoindex.has(url)
    ) {
      return null;
    }
    const orderIndex = scheduleOrder.get(url);
    if (orderIndex === undefined) return null;
    const batchIndex = Math.floor(orderIndex / schedule.batchSize);
    return addDays(schedule.startDate, batchIndex * schedule.intervalDays);
  }

  function getAllResults() {
    return merchants.flatMap((merchant) =>
      merchant.problems.flatMap((problemSlug) => {
        const problem = problemsBySlug.get(problemSlug);
        return problem ? [evaluate(merchant, problem)] : [];
      }),
    );
  }

  function evaluateUrl(url) {
    const match = url.match(/^\/hilfe\/([^/]+)\/([^/]+)$/);
    if (!match) return null;
    const merchant = merchantsBySlug.get(match[1]);
    const problem = problemsBySlug.get(match[2]);
    if (!merchant || !problem || !merchant.problems.includes(problem.slug)) return null;
    return evaluate(merchant, problem);
  }

  return {
    config,
    threshold,
    schedule,
    today,
    merchants,
    problems,
    merchantsBySlug,
    problemsBySlug,
    generateCopy,
    getMerchantIndexSeo,
    evaluate,
    evaluateUrl,
    getAllResults,
    isIndexableUrl: (url) => evaluateUrl(url)?.status === "index",
  };
}

function hasNoGenericPlaceholders(copy, patterns) {
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
  return !patterns.some((pattern) => haystack.includes(pattern));
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
