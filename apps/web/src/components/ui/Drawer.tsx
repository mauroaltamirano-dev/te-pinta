import { useEffect } from "react";
import { createPortal } from "react-dom";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Ancho del panel. Default: min(480px, 100vw) */
  width?: string;
};

/**
 * Drawer lateral derecho montado via React Portal directamente en document.body.
 * Soporta altura 100vh con flex-col layout.
 */
export function Drawer({
  open,
  onClose,
  children,
  width = "min(500px, 100vw)",
}: DrawerProps) {
  /* Cerrar con Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const portal = (
    <>
      {/* Overlay oscuro */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.55)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 250ms ease",
        }}
      />

      {/* Panel lateral */}
      <div
        role="dialog"
        aria-modal="true"
        className="overflow-hidden sm:rounded-l-2xl"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width,
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          boxShadow: "var(--shadow-lg)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Renderizar solo cuando abierto */}
        {open && children}
      </div>
    </>
  );

  return createPortal(portal, document.body);
}
