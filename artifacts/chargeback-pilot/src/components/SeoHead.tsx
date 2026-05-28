import { useLayoutEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  /** Optional JSON-LD structured data objects. */
  jsonLd?: object[];
}

const SITE_ORIGIN = "https://chargebackpilot.de";

function upsertMeta(selector: string, attrName: "name" | "property", attrVal: string, content: string) {
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

/**
 * Sets per-route page <title>, meta description, canonical, OG + Twitter tags,
 * and injects optional JSON-LD <script> tags. Cleans up its own JSON-LD on unmount.
 */
export function SeoHead({ title, description, canonical, noindex = false, jsonLd }: SeoHeadProps) {
  useLayoutEffect(() => {
    document.title = title;

    const canonicalUrl = canonical
      ? (canonical.startsWith("http") ? canonical : `${SITE_ORIGIN}${canonical}`)
      : `${SITE_ORIGIN}${window.location.pathname}`;

    // Standard Meta
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    upsertMeta(
      'meta[name="googlebot"]',
      "name",
      "googlebot",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1",
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

    // JSON-LD Injection
    const injected: HTMLScriptElement[] = [];
    if (jsonLd?.length) {
      for (const obj of jsonLd) {
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

  return null;
}
