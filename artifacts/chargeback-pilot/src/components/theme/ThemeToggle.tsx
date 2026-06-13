import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;
  const nextLabel = isDark ? "Helles Design aktivieren" : "Dunkles Design aktivieren";
  const currentLabel = isDark ? "Dunkles Design" : "Helles Design";

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`${nextLabel}. Aktuell: ${currentLabel}.`}
      title={`${nextLabel} · aktuell: ${currentLabel}`}
      data-theme-toggle={resolvedTheme}
      onClick={toggleTheme}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}
