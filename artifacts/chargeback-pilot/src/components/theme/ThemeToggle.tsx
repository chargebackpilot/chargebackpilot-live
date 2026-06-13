import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "./ThemeProvider";

const LABELS: Record<ThemePreference, string> = {
  system: "Systemdesign verwenden",
  light: "Helles Design verwenden",
  dark: "Dunkles Design verwenden",
};

export function ThemeToggle() {
  const { theme, resolvedTheme, cycleTheme } = useTheme();
  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const nextLabel =
    theme === "system"
      ? "Dunkles Design aktivieren"
      : theme === "dark"
        ? "Helles Design aktivieren"
        : "Systemdesign verwenden";

  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      aria-label={`${nextLabel}. Aktuell: ${LABELS[theme]}.`}
      title={`${nextLabel} · aktuell: ${LABELS[theme]}`}
      data-theme-toggle={theme}
      onClick={cycleTheme}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{nextLabel}</span>
    </button>
  );
}
