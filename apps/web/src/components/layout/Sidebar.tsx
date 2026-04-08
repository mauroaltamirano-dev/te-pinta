import { NavLink } from "react-router-dom";
import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Tags,
  Carrot,
  Package,
  BookOpen,
  ShoppingCart,
  Truck,
  ChefHat,
  Wallet,
  ReceiptText,
  Users,
  Settings,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";

import { APP_ROUTES } from "../../constants/routes";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  group?: string;
};

const navItems: NavItem[] = [
  {
    to: APP_ROUTES.dashboard,
    label: "Inicio",
    icon: LayoutDashboard,
    end: true,
    group: "principal",
  },
  {
    to: APP_ROUTES.categories,
    label: "Categorías",
    icon: Tags,
    group: "catalogo",
  },
  {
    to: APP_ROUTES.ingredients,
    label: "Ingredientes",
    icon: Carrot,
    group: "catalogo",
  },
  {
    to: APP_ROUTES.products,
    label: "Productos",
    icon: Package,
    group: "catalogo",
  },
  {
    to: APP_ROUTES.recipes,
    label: "Recetas",
    icon: BookOpen,
    group: "catalogo",
  },
  {
    to: APP_ROUTES.orders,
    label: "Pedidos",
    icon: ShoppingCart,
    group: "operacion",
  },
  {
    to: APP_ROUTES.purchases,
    label: "Compras",
    icon: Truck,
    group: "operacion",
  },
  {
    to: APP_ROUTES.production,
    label: "Producción",
    icon: ChefHat,
    group: "operacion",
  },
  {
    to: APP_ROUTES.finance,
    label: "Finanzas",
    icon: Wallet,
    group: "finanzas",
  },
  {
    to: APP_ROUTES.ledger,
    label: "Ingresos",
    icon: ReceiptText,
    group: "finanzas",
  },
  {
    to: APP_ROUTES.weeklyClosures,
    label: "Caja Semanal",
    icon: CalendarDays,
    group: "finanzas",
  },
  { to: APP_ROUTES.clients, label: "Clientes", icon: Users, group: "finanzas" },
  {
    to: APP_ROUTES.settings,
    label: "Configuración",
    icon: Settings,
    group: "sistema",
  },
];

const groups: { key: string; label: string }[] = [
  { key: "principal", label: "" },
  { key: "catalogo", label: "Catálogo" },
  { key: "operacion", label: "Operación" },
  { key: "finanzas", label: "Finanzas" },
  { key: "sistema", label: "Sistema" },
];

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <aside
      className={[
        // Base
        "fixed inset-y-0 left-0 z-40 flex h-screen flex-col",
        "border-r border-border-soft bg-background-soft",
        // Transición suave
        "transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        // Desktop: sticky, visible, ancho según estado
        "md:sticky md:top-0 md:z-auto md:translate-x-0",
        collapsed ? "md:w-[68px]" : "md:w-60",
        // Mobile: fuera de pantalla o visible
        mobileOpen ? "translate-x-0 w-68" : "-translate-x-full w-68",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Menú de navegación"
    >
      {/* ── Header del sidebar ── */}
      <div className="flex h-14 shrink-0 items-center border-b border-border-soft px-3">
        {collapsed ? (
          /* Collapsed: solo logo, centrado */
          <div className="flex w-full items-center justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              style={{ boxShadow: "0 1px 2px rgba(192, 122, 82, 0.25)" }}
            >
              <ChefHat size={15} />
            </div>
          </div>
        ) : (
          /* Expanded: logo + nombre + botón collapse */
          <div className="flex w-full items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              style={{ boxShadow: "0 1px 2px rgba(192, 122, 82, 0.25)" }}
            >
              <ChefHat size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">
                Te Pinta
              </p>
              <p className="text-[10px] font-medium text-foreground-faint">
                Gestión interna
              </p>
            </div>
            {/* Botón collapse — solo desktop */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground-faint transition hover:bg-surface-2 hover:text-foreground-muted"
              aria-label="Ocultar sidebar"
              title="Ocultar sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
            {/* Botón cerrar — solo mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex md:hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground-faint transition hover:bg-surface-2 hover:text-foreground-muted"
              aria-label="Cerrar menú"
              title="Cerrar menú"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Botón expand cuando está colapsado — solo desktop */}
      {collapsed && (
        <div className="hidden md:flex justify-center py-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-faint transition hover:bg-surface-2 hover:text-foreground-muted"
            aria-label="Expandir sidebar"
            title="Expandir sidebar"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>
      )}

      {/* ── Navegación ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2"
        aria-label="Navegación principal"
      >
        {groups.map(({ key, label }) => {
          const items = navItems.filter((i) => i.group === key);
          if (!items.length) return null;

          return (
            <div key={key} className="mb-0.5">
              {/* Etiqueta de grupo — solo cuando está expandido y tiene label */}
              {label && !collapsed && (
                <p className="mb-1 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
                  {label}
                </p>
              )}
              {/* Separador cuando está colapsado y no es el primer grupo */}
              {label && collapsed && (
                <div className="my-2 mx-2 border-t border-border-soft" />
              )}

              <ul className="flex flex-col gap-px">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          [
                            "group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
                            collapsed
                              ? "h-9 w-9 justify-center mx-auto"
                              : "h-9 gap-2.5 px-2.5",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground-muted hover:bg-surface-2 hover:text-foreground",
                          ].join(" ")
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Indicador activo — barra vertical izquierda */}
                            {isActive && !collapsed && (
                              <span
                                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary"
                                style={{ opacity: 0.8 }}
                              />
                            )}
                            <Icon
                              size={16}
                              strokeWidth={isActive ? 2.2 : 1.8}
                              className={[
                                "shrink-0 transition-transform duration-150",
                                "group-hover:scale-105",
                                isActive ? "text-primary" : "",
                              ].join(" ")}
                            />
                            {!collapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── Footer del sidebar ── */}
      {!collapsed && (
        <div className="shrink-0 border-t border-border-soft px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-primary"
              style={{ background: "rgba(192, 122, 82, 0.12)" }}
            >
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground-soft">
                Administrador
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
