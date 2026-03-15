import { useMemo, useState } from "react";

import { usePurchases } from "./use-purchases";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const TYPE_LABELS: Record<string, string> = {
  all: "Todos los tipos",
  ingredient: "Ingredientes",
  operational: "Operativos",
  investment: "Inversiones",
};

const TYPE_COLORS: Record<string, string> = {
  ingredient: "bg-blue-100 text-blue-700",
  operational: "bg-yellow-100 text-yellow-700",
  investment: "bg-purple-100 text-purple-700",
};

export function PurchasesLedgerTable() {
  const { data, isLoading } = usePurchases();
  const [typeFilter, setTypeFilter] = useState<
    "all" | "ingredient" | "operational" | "investment"
  >("all");

  const filteredData = useMemo(() => {
    if (!data) return [];

    if (typeFilter === "all") {
      return data;
    }

    return data.filter((purchase) => purchase.type === typeFilter);
  }, [data, typeFilter]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando libro contable...</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="flex flex-col gap-4 border-b border-sombra px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-bordo">
            Libro de movimientos
          </h2>
          <p className="mt-1 text-sm text-cafe/75">
            Historial detallado de todas las compras y gastos registrados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="ledger-type-filter"
            className="text-sm font-medium text-cafe"
          >
            Filtrar por tipo
          </label>
          <select
            id="ledger-type-filter"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value as
                  | "all"
                  | "ingredient"
                  | "operational"
                  | "investment",
              )
            }
            className="rounded-2xl border border-sombra bg-white/60 px-4 py-2 text-sm text-cafe outline-none transition focus:border-bordo"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-5 py-2 text-sm text-cafe/70">
        Registros:{" "}
        <span className="font-semibold text-bordo">{filteredData.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full">
          <thead className="bg-arena/70">
            <tr>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Fecha
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Tipo
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Descripción
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Proveedor
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Total
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Notas
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((purchase) => (
              <tr key={purchase.id} className="transition hover:bg-arena/30">
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                  {formatDate(purchase.date)}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      TYPE_COLORS[purchase.type] ?? "bg-arena text-cafe",
                    ].join(" ")}
                  >
                    {TYPE_LABELS[purchase.type] ?? purchase.type}
                  </span>
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                  {purchase.nameSnapshot}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/80">
                  {purchase.supplier ?? "—"}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm font-semibold text-cafe">
                  {formatMoney(purchase.totalAmount)}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/70">
                  {purchase.notes ?? "—"}
                </td>
              </tr>
            ))}

            {!filteredData.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  No hay registros para el filtro seleccionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
