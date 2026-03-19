import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { APP_ROUTES } from "../../constants/routes";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ClientsPage } from "../../pages/clients/clients-page";
import { DashboardPage } from "../../pages/dashboard/dashboard-page";
import { FinancePage } from "../../pages/finance/finance-page";
import { LedgerPage } from "../../pages/ledger/LedgerPage";
import { OrdersPage } from "../../pages/orders/orders-page";
import { ProductsPage } from "../../pages/products/products-page";
import { SettingsPage } from "../../pages/settings/settings-page";
import { CategoriesPage } from "../../pages/categories/categories-page";
import { IngredientsPage } from "../../pages/ingredients/ingredients-page";
import { ProductionPage } from "../../pages/production/production-page";
import { RecipesPage } from "../../pages/recipes/recipes-page";
import { PurchasesPage } from "../../pages/purchases/purchases-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.login} element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={APP_ROUTES.clients} element={<ClientsPage />} />
          <Route path={APP_ROUTES.products} element={<ProductsPage />} />
          <Route path={APP_ROUTES.orders} element={<OrdersPage />} />
          <Route path={APP_ROUTES.finance} element={<FinancePage />} />
          <Route path={APP_ROUTES.ledger} element={<LedgerPage />} />
          <Route path={APP_ROUTES.settings} element={<SettingsPage />} />
          <Route path={APP_ROUTES.categories} element={<CategoriesPage />} />
          <Route path={APP_ROUTES.ingredients} element={<IngredientsPage />} />
          <Route path={APP_ROUTES.production} element={<ProductionPage />} />
          <Route path={APP_ROUTES.recipes} element={<RecipesPage />} />
          <Route path={APP_ROUTES.purchases} element={<PurchasesPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={APP_ROUTES.dashboard} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
