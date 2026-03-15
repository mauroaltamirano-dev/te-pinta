import { usePurchases } from "./use-purchases";

const TYPE_LABELS: Record<string, string> = {
  ingredient: "Ingrediente",
  operational: "Operativo",
  investment: "Inversión",
};

const TYPE_COLORS: Record<string, string> = {
  ingredient: "bg-blue-100 text-blue-700",
  operational: "bg-yellow-100 text-yellow-700",
  investment: "bg-purple-100 text-purple-700",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

export function PurchasesTable() {
  const { data, isLoading } = usePurchases();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando compras...</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h2 className="text-lg font-bold text-bordo">Historial de compras</h2>
        <p className="mt-1 text-sm text-cafe/75">
          Registro de compras de ingredientes, gastos operativos e inversiones.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full">
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
                Cantidad
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Unidad
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Precio unit.
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Total
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Proveedor
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.map((purchase) => (
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
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                  {purchase.quantity ?? "—"}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                  {purchase.unit ?? "—"}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                  {purchase.unitPrice != null ? formatMoney(purchase.unitPrice) : "—"}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-cafe">
                  {formatMoney(purchase.totalAmount)}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/80">
                  {purchase.supplier ?? "—"}
                </td>
              </tr>
            ))}

            {!data?.length ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  Todavía no hay compras registradas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
