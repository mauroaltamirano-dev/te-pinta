import { useMemo } from "react";

import { useOrders } from "./use-orders";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

export function OrdersRevenueTable() {
  const { data, isLoading } = useOrders();

  const deliveredOrders = useMemo(() => {
    if (!data) return [];

    return data.filter((order) => order.status === "delivered");
  }, [data]);

  if (isLoading) {
    return (
      <div className="px-5 py-6">
        <p className="text-sm text-cafe/70">Cargando pedidos entregados...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[600px] w-full">
        <thead className="bg-arena/70">
          <tr>
            <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
              Fecha
            </th>
            <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
              Cliente
            </th>
            <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
              Estado
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
          {deliveredOrders.map((order) => (
            <tr key={order.id} className="transition hover:bg-arena/30">
              <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                {new Date(order.createdAt).toLocaleDateString("es-AR")}
              </td>
              <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                {order.customerNameSnapshot ?? "Consumidor final"}
              </td>
              <td className="border-b border-sombra px-5 py-4 text-sm">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Entregado
                </span>
              </td>
              <td className="border-b border-sombra px-5 py-4 text-sm font-semibold text-cafe">
                {formatMoney(order.totalAmount)}
              </td>
              <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/70">
                {order.notes ?? "—"}
              </td>
            </tr>
          ))}

          {!deliveredOrders.length ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-10 text-center text-sm text-cafe/65"
              >
                Todavía no hay pedidos entregados registrados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
