import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./app/layouts/AppLayout";
import { APP_ROUTES } from "./constants/routes";
import { CategoriesPage } from "./pages/categories/categories-page";
import { ClientsPage } from "./pages/clients/clients-page";
import { IngredientsPage } from "./pages/ingredients/ingredients-page";
import { FinancePage } from "./pages/finance/finance-page";
import { OrdersPage } from "./pages/orders/orders-page";
import { ProductionPage } from "./pages/production/production-page";
import { ProductsPage } from "./pages/products/products-page";
import { PurchasesPage } from "./pages/purchases/purchases-page";
import { RecipesPage } from "./pages/recipes/recipes-page";
import { RevenuePage } from "./pages/renueve/revenue-page";
import { SalesDashboardPage } from "./pages/dashboard/dashboard-page";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={APP_ROUTES.dashboard} element={<SalesDashboardPage />} />
        <Route path={APP_ROUTES.categories} element={<CategoriesPage />} />
        <Route path={APP_ROUTES.ingredients} element={<IngredientsPage />} />
        <Route path={APP_ROUTES.products} element={<ProductsPage />} />
        <Route path={APP_ROUTES.recipes} element={<RecipesPage />} />
        <Route path={APP_ROUTES.orders} element={<OrdersPage />} />
        <Route path={APP_ROUTES.production} element={<ProductionPage />} />
        <Route path={APP_ROUTES.purchases} element={<PurchasesPage />} />
        <Route path={APP_ROUTES.finance} element={<FinancePage />} />
        <Route path={APP_ROUTES.ledger} element={<RevenuePage />} />
        <Route path={APP_ROUTES.clients} element={<ClientsPage />} />
        <Route
          path={APP_ROUTES.settings}
          element={
            <div className="rounded-3xl border border-arena bg-crema p-8 text-cafe shadow-sm">
              <h1 className="text-2xl font-bold text-bordo">Configuración</h1>
              <p className="mt-2 text-cafe/80">
                Esta sección la armamos después.
              </p>
            </div>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={APP_ROUTES.categories} replace />}
      />
    </Routes>
  );
}

export default App;
