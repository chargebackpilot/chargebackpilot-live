import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const SITE_ORIGIN = "https://chargebackpilot.de";

/**
 * Visual breadcrumbs + JSON-LD BreadcrumbList for SEO.
 * Drop in at the top of any sub-page below the header.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const all: BreadcrumbItem[] = [{ label: "Start", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_ORIGIN}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="container mx-auto max-w-5xl px-4 pt-4">
        <ol className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {i === 0 && <Home className="w-3 h-3" aria-hidden />}
                {item.href && !last ? (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={last ? "text-foreground font-medium" : ""} aria-current={last ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
                {!last && <ChevronRight className="w-3 h-3 opacity-60" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
