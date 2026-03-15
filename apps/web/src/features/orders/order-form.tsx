import { useState } from "react";

import { useClients } from "../clients/use-clients";
import { useProducts } from "../products/use-products";
import { useCreateOrder } from "./use-orders";

type OrderFormItem = {
  productId: string;
  quantity: number;
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  local: "Local / presencial",
  phone: "Teléfono",
  other: "Otro",
};

export function OrderForm() {
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const mutation = useCreateOrder();

  const [clientId, setClientId] = useState("");
  const [channel, setChannel] = useState<
    "whatsapp" | "instagram" | "local" | "phone" | "other"
  >("whatsapp");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState<OrderFormItem[]>([
    { productId: "", quantity: 1 },
  ]);

  const updateItem = (index: number, next: Partial<OrderFormItem>) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...next } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setClientId("");
    setChannel("whatsapp");
    setNotes("");
    setDiscountAmount(0);
    setItems([{ productId: "", quantity: 1 }]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanItems = items.filter(
      (item) => item.productId && Number(item.quantity) > 0,
    );

    mutation.mutate(
      {
        clientId: clientId || undefined,
        channel,
        notes: notes || undefined,
        discountAmount: Number(discountAmount),
        items: cleanItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      },
      {
        onSuccess: () => resetForm(),
      },
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-sombra bg-crema p-5 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cafe/65">
          Nuevo pedido
        </p>
        <h2 className="mt-2 text-xl font-bold text-bordo">Registrar pedido</h2>
        <p className="mt-2 text-sm leading-6 text-cafe/80">
          Completá los datos del pedido: cliente, canal de venta, productos y
          descuento si corresponde.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="order-client" className="text-sm font-semibold text-cafe">
          Cliente <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Asociá el pedido a un cliente registrado, o dejalo en blanco si es
          una venta sin cliente identificado.
        </p>
        <select
          id="order-client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          <option value="">Sin cliente asociado</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} — {client.phone}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="order-channel" className="text-sm font-semibold text-cafe">
          Canal de venta
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          ¿Por dónde llegó el pedido? Esto ayuda a analizar qué canales generan
          más ventas.
        </p>
        <select
          id="order-channel"
          value={channel}
          onChange={(e) =>
            setChannel(
              e.target.value as
                | "whatsapp"
                | "instagram"
                | "local"
                | "phone"
                | "other",
            )
          }
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        >
          {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="order-discount" className="text-sm font-semibold text-cafe">
          Descuento <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Monto fijo a descontar del total del pedido. Dejalo en 0 si no
          aplicás descuento.
        </p>
        <input
          id="order-discount"
          type="number"
          step="0.01"
          min="0"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(Number(e.target.value))}
          placeholder="Ej: 500"
          className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition focus:border-bordo"
        />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-cafe">Productos del pedido</p>
          <p className="mt-0.5 text-xs leading-5 text-cafe/70">
            Agregá los productos que se solicitan. Podés incluir más de uno.
          </p>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl border border-sombra bg-arena/40 p-4 md:grid-cols-[1fr_140px_auto]"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-cafe/70">Producto</label>
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, { productId: e.target.value })}
                className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
              >
                <option value="">Seleccionar producto</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-cafe/70">Cantidad</label>
              <input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                placeholder="Unidades"
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
                className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="w-full rounded-2xl border border-sombra bg-arena px-4 py-3 text-sm font-semibold text-cafe transition hover:bg-sombra/60 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={items.length === 1}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-2xl border border-sombra bg-arena/60 px-4 py-3 text-sm font-semibold text-cafe transition hover:bg-arena"
        >
          + Agregar otro producto
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="order-notes" className="text-sm font-semibold text-cafe">
          Notas del pedido <span className="font-normal text-cafe/50">(opcional)</span>
        </label>
        <p className="text-xs leading-5 text-cafe/70">
          Cualquier indicación especial del cliente: sin sal, con extras,
          horario de entrega, etc.
        </p>
        <textarea
          id="order-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ej: Sin cebolla, entrega a las 18hs"
          className="w-full resize-none rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-bordo px-4 py-3 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-60"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Registrando pedido..." : "Registrar pedido"}
      </button>

      {mutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Ocurrió un error al registrar el pedido"}
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Pedido registrado correctamente.
        </div>
      ) : null}
    </form>
  );
}
