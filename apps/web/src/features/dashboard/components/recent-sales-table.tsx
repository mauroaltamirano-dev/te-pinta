import type { RecentSaleItem } from "../../../services/api/dashboard.api";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-600",
};

type Props = {
  data: RecentSaleItem[];
};

export function RecentSalesTable({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h3 className="text-lg font-bold text-bordo">Últimas ventas</h3>
        <p className="mt-1 text-sm text-cafe/75">
          Pedidos más recientes del período seleccionado.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full">
          <thead className="bg-arena/70">
            <tr>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Cliente
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Canal
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Estado
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Fecha
              </th>
              <th className="border-b border-sombra px-5 py-4 text-right text-sm font-semibold text-cafe">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <tr key={sale.id} className="transition hover:bg-arena/30">
                <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                  {sale.customerName ?? "Consumidor final"}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                  {sale.paymentMethod}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm">
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_COLORS[sale.status] ?? "bg-arena text-cafe",
                    ].join(" ")}
                  >
                    {STATUS_LABELS[sale.status] ?? sale.status}
                  </span>
                </td>
                <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/80">
                  {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="border-b border-sombra px-5 py-4 text-right text-sm font-semibold text-cafe">
                  ${sale.total.toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
            {!data.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  Sin ventas en el período seleccionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
