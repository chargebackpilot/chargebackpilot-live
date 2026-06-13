import { useEffect, useLayoutEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  /** Optional JSON-LD structured data objects. */
  jsonLd?: object[];
}

const SITE_ORIGIN = "https://chargebackpilot.de";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface StandardSeoHeadInput {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export function resolveCanonicalUrl(canonical?: string) {
  if (canonical) {
    return canonical.startsWith("http") ? canonical : `${SITE_ORIGIN}${canonical}`;
  }

  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;
  return `${SITE_ORIGIN}${pathname}`;
}

function buildBaseJsonLd(canonicalUrl: string): object[] {
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const webApplicationId = `${SITE_ORIGIN}/#webapplication`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: "ChargebackPilot",
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/favicon.svg`,
      },
      areaServed: {
        "@type": "Country",
        name: "Deutschland",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: "ChargebackPilot",
      url: SITE_ORIGIN,
      inLanguage: "de-DE",
      publisher: {
        "@id": organizationId,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": webApplicationId,
      name: "ChargebackPilot",
      url: `${SITE_ORIGIN}/`,
      description:
        "KI-gestützte Formulierungshilfe für Chargeback, PayPal-Käuferschutz, Klarna-Reklamationen und Kreditkarten-Reklamationen in Deutschland. Erstellt strukturierte Textvorlagen und druckfertige DIN-5008-Briefe.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      inLanguage: "de-DE",
      isAccessibleForFree: true,
      publisher: {
        "@id": organizationId,
      },
      offers: {
        "@type": "Offer",
        price: "0.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        category: "Einzelfall-Freischaltung digitaler Inhalte",
      },
    },
  ];
}

function upsertMeta(
  selector: string,
  attrName: "name" | "property",
  attrVal: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyStandardSeoHead({
  title,
  description,
  canonical,
  noindex = false,
}: StandardSeoHeadInput) {
  if (typeof document === "undefined") return;

  if (document.title !== title) {
    document.title = title;
  }

  const canonicalUrl = resolveCanonicalUrl(canonical);

  // Standard Meta
  upsertMeta('meta[name="description"]', "name", "description", description);
  upsertMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    noindex
      ? "noindex, follow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );
  upsertMeta(
    'meta[name="googlebot"]',
    "name",
    "googlebot",
    noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"
  );

  // Open Graph (Facebook, LinkedIn, WhatsApp)
  upsertMeta('meta[property="og:title"]', "property", "og:title", title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", description);
  upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  upsertMeta('meta[property="og:type"]', "property", "og:type", "website");

  // Fallback Image handling
  // If a route wants a specific image, we could pass it via props.
  // Here we ensure the base image is fully qualified for social crawlers.
  const ogImage = `${SITE_ORIGIN}/opengraph.jpg`;
  upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
  upsertMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
  upsertMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");

  // Twitter Card
  upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
  upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

  // Canonical
  upsertLink("canonical", canonicalUrl);
}

/**
 * Sets per-route page <title>, meta description, canonical, OG + Twitter tags,
 * and injects optional JSON-LD <script> tags. Cleans up its own JSON-LD on unmount.
 */
export function SeoHead({ title, description, canonical, noindex = false, jsonLd }: SeoHeadProps) {
  const ssrCanonicalUrl = typeof window === "undefined" ? resolveCanonicalUrl(canonical) : "";

  useIsomorphicLayoutEffect(() => {
    applyStandardSeoHead({ title, description, canonical, noindex });

    // JSON-LD Injection. Global schemas describe the product/site/organization;
    // route-specific schemas must still describe visible page content only.
    const injected: HTMLScriptElement[] = [];
    const canonicalUrl = resolveCanonicalUrl(canonical);
    const allJsonLd = noindex
      ? (jsonLd ?? [])
      : [...buildBaseJsonLd(canonicalUrl), ...(jsonLd ?? [])];
    if (allJsonLd.length) {
      for (const obj of allJsonLd) {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.cbpDynamic = "1";
        s.textContent = JSON.stringify(obj);
        document.head.appendChild(s);
        injected.push(s);
      }
    }

    return () => {
      injected.forEach((s) => s.remove());
    };
  }, [title, description, canonical, noindex, jsonLd]);

  const ssrJsonLd =
    typeof window === "undefined"
      ? noindex
        ? (jsonLd ?? [])
        : [...buildBaseJsonLd(ssrCanonicalUrl), ...(jsonLd ?? [])]
      : [];

  if (ssrJsonLd.length) {
    return (
      <>
        {ssrJsonLd.map((obj, index) => (
          <script
            key={index}
            type="application/ld+json"
            data-cbp-ssr-json-ld="1"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
          />
        ))}
      </>
    );
  }

  return null;
}
