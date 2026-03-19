import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";

const pageTitles: Record<string, string> = {
  "/": "Gestión operativa",
  "/categories": "Categorías",
  "/ingredients": "Ingredientes",
  "/products": "Productos",
  "/recipes": "Recetas",
  "/orders": "Pedidos",
  "/purchases": "Compras",
  "/production": "Producción",
  "/finance": "Finanzas",
  "/ledger": "Ingresos",
  "/clients": "Clientes",
  "/settings": "Configuración",
};

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Bloquear scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const pageTitle = useMemo(() => {
    return pageTitles[location.pathname] ?? "Panel interno";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Overlay móvil — fuera del Sidebar para evitar z-index issues */}
      {mobileSidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <Topbar
          title={pageTitle}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-6 md:px-6 xl:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
