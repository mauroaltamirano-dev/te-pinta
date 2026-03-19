import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

// ── Anti-flash: aplicar el tema ANTES de que React monte ────
// Este script corre de forma síncrona, antes del primer paint.
// Sin esto, el usuario ve un flash del tema incorrecto en el
// primer render si su preferencia guardada difiere del default.
(function () {
  try {
    const stored = localStorage.getItem("tepinta-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const theme = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    // localStorage bloqueado — dejar el default del CSS (:root = dark)
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
