import { useCallback, useState, useMemo } from "react";
import { MdAdd, MdEdit, MdPowerSettingsNew, MdPerson } from "react-icons/md";

import type { Client } from "../../services/api/clients.api";
import {
  useClients,
  useDeactivateClient,
  useReactivateClient,
} from "../../features/clients/use-clients";
import { ClientForm } from "../../features/clients/client-form";
import { ClientDetailDrawer } from "../../features/clients/client-detail-drawer";
import { Drawer } from "../../components/ui/Drawer";

/* ── tipos ──────────────────────────────────────────────────── */
type DrawerMode = "form" | "detail" | null;
type StatusFilter = "active" | "all" | "inactive";

/* ── Página principal ───────────────────────────────────────── */
export function ClientsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useClients({
    includeInactive: statusFilter !== "active",
  });

  const deactivateMutation = useDeactivateClient();
  const reactivateMutation = useReactivateClient();
  const isToggling =
    deactivateMutation.isPending || reactivateMutation.isPending;

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = search.toLowerCase().trim();
    return clients.filter((c) => {
      const matchStatus =
        statusFilter === "active"
          ? c.isActive
          : statusFilter === "inactive"
            ? !c.isActive
            : true;
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [clients, statusFilter, search]);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setTimeout(() => setSelectedClient(null), 300);
  }, []);

  const openForm = useCallback((client?: Client) => {
    setSelectedClient(client ?? null);
    setDrawerMode("form");
  }, []);

  const openDetail = useCallback((client: Client) => {
    setSelectedClient(client);
    setDrawerMode("detail");
  }, []);

  const FILTER_TABS: { value: StatusFilter; label: string }[] = [
    { value: "active", label: "Activos" },
    { value: "all", label: "Todos" },
    { value: "inactive", label: "Inactivos" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Ventas
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Clientes</h1>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nuevo cliente
        </button>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Toolbar */}
        <div
          className="border-b px-5 py-4"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--surface-2)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Listado
              </h2>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Búsqueda */}
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar…"
                  className="rounded-xl border py-2 pl-8 pr-3 text-xs outline-none transition"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    width: "160px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px var(--ring)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Filtro estado */}
              <div
                className="flex gap-1 rounded-xl border p-1"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                    style={
                      statusFilter === tab.value
                        ? {
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                          }
                        : {
                            background: "transparent",
                            color: "var(--foreground-muted)",
                          }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div
            className="flex items-center justify-center px-6 py-12 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            <span className="animate-pulse">Cargando clientes…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  {["Cliente", "Teléfono", "Dirección", "Estado", ""].map(
                    (col) => (
                      <th
                        key={col}
                        className="border-b px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          borderColor: "var(--border-soft)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {clients?.length === 0
                        ? "No hay clientes registrados."
                        : "No hay clientes con el filtro seleccionado."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="transition"
                      style={{ opacity: client.isActive ? 1 : 0.55 }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "var(--surface-hover)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "transparent")
                      }
                    >
                      {/* Nombre */}
                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <p
                          className="font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {client.name}
                        </p>
                        {client.notes && (
                          <p
                            className="mt-0.5 text-xs truncate max-w-[180px]"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {client.notes}
                          </p>
                        )}
                      </td>

                      {/* Teléfono */}
                      <td
                        className="border-b px-5 py-3.5 text-xs tabular-nums"
                        style={{
                          borderColor: "var(--border-soft)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {client.phone ?? (
                          <span style={{ color: "var(--foreground-faint)" }}>
                            —
                          </span>
                        )}
                      </td>

                      {/* Dirección */}
                      <td
                        className="border-b px-5 py-3.5 text-xs"
                        style={{
                          borderColor: "var(--border-soft)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {client.address ?? (
                          <span style={{ color: "var(--foreground-faint)" }}>
                            —
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={
                            client.isActive
                              ? {
                                  background: "var(--success-soft)",
                                  color: "var(--success-text)",
                                }
                              : {
                                  background: "var(--surface-3)",
                                  color: "var(--foreground-muted)",
                                }
                          }
                        >
                          <span
                            className="mr-1.5 h-1.5 w-1.5 rounded-full"
                            style={{
                              background: client.isActive
                                ? "var(--success)"
                                : "var(--foreground-faint)",
                            }}
                          />
                          {client.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* Ver historial */}
                          <button
                            type="button"
                            onClick={() => openDetail(client)}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                            style={{
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--foreground-soft)",
                            }}
                          >
                            <MdPerson size={13} />
                            Perfil
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => openForm(client)}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                            style={{
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--foreground-soft)",
                            }}
                          >
                            <MdEdit size={13} />
                            Editar
                          </button>

                          {/* Activar / Desactivar */}
                          {client.isActive ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `¿Desactivar a "${client.name}"?`,
                                  )
                                )
                                  deactivateMutation.mutate(client.id);
                              }}
                              disabled={isToggling}
                              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40"
                              style={{
                                background: "var(--surface-2)",
                                borderColor: "var(--border)",
                                color: "var(--foreground-muted)",
                              }}
                            >
                              <MdPowerSettingsNew size={13} />
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                reactivateMutation.mutate(client.id)
                              }
                              disabled={isToggling}
                              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40"
                              style={{
                                background: "var(--success-soft)",
                                borderColor: "var(--success)",
                                color: "var(--success-text)",
                              }}
                            >
                              <MdPowerSettingsNew size={13} />
                              Activar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drawers ─────────────────────────────────────────── */}
      <Drawer open={drawerMode === "form"} onClose={closeDrawer}>
        <ClientForm client={selectedClient} onClose={closeDrawer} />
      </Drawer>

      <Drawer open={drawerMode === "detail"} onClose={closeDrawer}>
        {selectedClient && (
          <ClientDetailDrawer
            clientId={selectedClient.id}
            onClose={closeDrawer}
          />
        )}
      </Drawer>
    </div>
  );
}
