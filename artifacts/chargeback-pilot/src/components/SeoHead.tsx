import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
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
export function SeoHead({ title, description, canonical, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    const canonicalUrl = canonical
      ? (canonical.startsWith("http") ? canonical : `${SITE_ORIGIN}${canonical}`)
      : `${SITE_ORIGIN}${window.location.pathname}`;
    upsertLink("canonical", canonicalUrl);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);

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
      document.title = prevTitle;
      injected.forEach((s) => s.remove());
    };
  }, [title, description, canonical, jsonLd]);

  return null;
}
