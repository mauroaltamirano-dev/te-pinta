import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
