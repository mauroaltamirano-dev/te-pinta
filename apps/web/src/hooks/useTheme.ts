import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "tepinta-theme";

function getInitialTheme(): Theme {
  // 1. Preferencia guardada
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage no disponible (SSR, incógnito bloqueado, etc.)
  }

  // 2. Preferencia del sistema operativo
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // color-scheme ayuda al navegador a renderizar scrollbars, inputs, etc.
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Aplicar al DOM cada vez que cambia
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // silencioso
    }
  }, [theme]);

  // Escuchar cambios del sistema operativo (si el usuario no eligió manualmente)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Solo sincronizar si no hay preferencia guardada
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) setTheme(e.matches ? "dark" : "light");
      } catch {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme, toggleTheme, isDark: theme === "dark" };
}