// src/features/dashboard/components/sales-by-channel-list.tsx
import type { SalesByPaymentMethodItem } from "../../../services/api/dashboard.api";

type Props = {
  data: SalesByPaymentMethodItem[];
};

function getChannelLabel(value: string) {
  const labels: Record<string, string> = {
    store: "Local",
    whatsapp: "WhatsApp",
    phone: "Teléfono",
    instagram: "Instagram",
    web: "Web",
  };

  return labels[value] ?? value;
}

export function SalesByChannelList({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h3 className="text-lg font-bold text-bordo">Ventas por canal</h3>
        <p className="mt-1 text-sm text-cafe/75">
          Distribución de ventas según el canal de ingreso del pedido.
        </p>
      </div>

      <div className="space-y-2 p-4">
        {data.length ? (
          data.map((item) => (
            <div
              key={item.paymentMethod}
              className="flex items-center justify-between rounded-2xl border border-sombra bg-white/50 px-4 py-3 transition hover:bg-arena/40"
            >
              <p className="text-sm font-semibold text-cafe">
                {getChannelLabel(item.paymentMethod)}
              </p>
              <p className="text-sm font-bold text-bordo">
                ${item.total.toLocaleString("es-AR")}
              </p>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-cafe/60">
            Sin datos en el período seleccionado.
          </p>
        )}
      </div>
    </section>
  );
}
