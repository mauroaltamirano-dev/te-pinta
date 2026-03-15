import { Outlet } from "react-router-dom";

import { Sidebar } from "../../components/layout/Sidebar";
import { Topbar } from "../../components/layout/Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-crema text-cafe md:flex">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 bg-crema px-4 py-5 md:px-8 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
