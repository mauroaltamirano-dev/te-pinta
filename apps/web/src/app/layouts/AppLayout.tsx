import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";
import { APP_ROUTES } from "../../constants/routes";

const pageTitles: Record<string, string> = {
  [APP_ROUTES.dashboard]: "Gestión operativa",
  [APP_ROUTES.categories]: "Categorías",
  [APP_ROUTES.ingredients]: "Ingredientes",
  [APP_ROUTES.products]: "Productos",
  [APP_ROUTES.recipes]: "Recetas",
  [APP_ROUTES.orders]: "Pedidos",
  [APP_ROUTES.purchases]: "Compras",
  [APP_ROUTES.production]: "Producción",
  [APP_ROUTES.finance]: "Finanzas — Egresos",
  [APP_ROUTES.ledger]: "Ingresos",
  [APP_ROUTES.weeklyClosures]: "Caja Semanal",
  [APP_ROUTES.clients]: "Clientes",
  [APP_ROUTES.settings]: "Configuración",
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
