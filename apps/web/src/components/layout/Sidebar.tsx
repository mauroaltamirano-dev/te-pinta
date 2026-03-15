import { NavLink } from "react-router-dom";

import { APP_ROUTES } from "../../constants/routes";

const navItems = [
  { to: APP_ROUTES.dashboard, label: "Inicio", end: true },
  { to: APP_ROUTES.categories, label: "Categorías" },
  { to: APP_ROUTES.ingredients, label: "Ingredientes" },
  { to: APP_ROUTES.products, label: "Productos" },
  { to: APP_ROUTES.recipes, label: "Recetas" },
  { to: APP_ROUTES.orders, label: "Pedidos" },
  { to: APP_ROUTES.purchases, label: "Compras" },
  { to: APP_ROUTES.production, label: "Producción" },
  { to: APP_ROUTES.finance, label: "Finanzas" },
  { to: APP_ROUTES.ledger, label: "Ingresos" },
  { to: APP_ROUTES.clients, label: "Clientes" },
  { to: APP_ROUTES.settings, label: "Configuración" },
];

export function Sidebar() {
  return (
    <aside className="w-full border-b border-sombra bg-arena md:w-72 md:border-b-0 md:border-r">
      <div className="border-b border-sombra px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cafe/70">
          Te Pinta
        </p>

        <h1 className="mt-2 text-2xl font-bold text-bordo">Gestión interna</h1>

        <p className="mt-2 text-sm text-cafe/80">
          Panel administrativo del emprendimiento.
        </p>
      </div>

      <nav className="flex flex-col gap-2 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-bordo text-crema shadow-sm"
                  : "text-cafe hover:bg-crema hover:text-bordo",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
