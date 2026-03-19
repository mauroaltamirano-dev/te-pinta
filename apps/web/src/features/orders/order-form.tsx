import { useEffect, useMemo, useState } from "react";
import { MdClose, MdAdd, MdRemove } from "react-icons/md";

import type { Order } from "../../services/api/orders.api";
import { useClients } from "../clients/use-clients";
import { useProducts } from "../products/use-products";
import { useCreateOrder, useOrderById, useUpdateOrder } from "./use-orders";

type OrderFormItem = {
  productId: string;
  quantity: number;
};

type OrderChannel = "whatsapp" | "instagram" | "local" | "phone" | "other";
type PaymentMethod = "cash" | "transfer";

const CHANNEL_OPTIONS: { value: OrderChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "local", label: "Local / presencial" },
  { value: "phone", label: "Teléfono" },
  { value: "other", label: "Otro" },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
];

const EMPTY_ITEM: OrderFormItem = { productId: "", quantity: 1 };

const fieldBase =
  "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition";
const smallFieldBase =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition";

const fieldStyle = (isEditing: boolean, hasError = false) => ({
  background: "var(--background)",
  borderColor: hasError ? "var(--danger)" : "var(--border)",
  color: "var(--foreground)",
});

function makeFocusOn(isEditing: boolean) {
  return (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    e.target.style.borderColor = isEditing
      ? "var(--warning)"
      : "var(--primary)";
    e.target.style.boxShadow = `0 0 0 3px ${
      isEditing ? "var(--warning-soft)" : "var(--ring)"
    }`;
  };
}

function makeFocusOff() {
  return (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };
}

export function OrderForm({
  order,
  onCancelEdit,
}: {
  order?: Order | null;
  onCancelEdit?: () => void;
}) {
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const detailQuery = useOrderById(order?.id ?? "");

  const isEditing = !!order;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const error = createMutation.error || updateMutation.error;

  const focusOn = makeFocusOn(isEditing);
  const focusOff = makeFocusOff();

  const [clientId, setClientId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [channel, setChannel] = useState<OrderChannel>("whatsapp");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [hasDeliveryTime, setHasDeliveryTime] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [items, setItems] = useState<OrderFormItem[]>([{ ...EMPTY_ITEM }]);

  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);

  const resetForm = () => {
    setClientId("");
    setCustomerName("");
    setChannel("whatsapp");
    setDeliveryDate("");
    setHasDeliveryTime(false);
    setDeliveryTime("");
    setPaymentMethod("cash");
    setIsPaid(false);
    setNotes("");
    setDiscountAmount(0);
    setItems([{ ...EMPTY_ITEM }]);
  };

  useEffect(() => {
    if (!order) {
      setLoadedOrderId(null);
      resetForm();
    }
  }, [order]);

  useEffect(() => {
    if (
      order &&
      detailQuery.data &&
      detailQuery.data.id === order.id &&
      loadedOrderId !== order.id
    ) {
      setLoadedOrderId(order.id);
      setClientId(detailQuery.data.clientId ?? "");
      setCustomerName(detailQuery.data.customerNameSnapshot ?? "");
      setChannel(detailQuery.data.channel);
      const raw = detailQuery.data.deliveryDate;
      if (raw) {
        const d = new Date(raw);
        setDeliveryDate(d.toISOString().slice(0, 10));
        const timeStr = d.toTimeString().slice(0, 5);
        const hasTime = timeStr !== "00:00";
        setHasDeliveryTime(hasTime);
        setDeliveryTime(hasTime ? timeStr : "");
      } else {
        setDeliveryDate("");
        setHasDeliveryTime(false);
        setDeliveryTime("");
      }
      setPaymentMethod(detailQuery.data.paymentMethod);
      setIsPaid(detailQuery.data.isPaid);
      setNotes(detailQuery.data.notes ?? "");
      setDiscountAmount(detailQuery.data.discountAmount ?? 0);
      setItems(
        detailQuery.data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      );
    }
  }, [detailQuery.data, loadedOrderId, order]);

  const updateItem = (index: number, next: Partial<OrderFormItem>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...next } : item)),
    );

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const cleanItems = useMemo(
    () => items.filter((i) => i.productId && Number(i.quantity) > 0),
    [items],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buildDeliveryISO = () => {
      if (!deliveryDate) return undefined;
      if (hasDeliveryTime && deliveryTime) {
        return new Date(`${deliveryDate}T${deliveryTime}:00`).toISOString();
      }
      return new Date(`${deliveryDate}T00:00:00`).toISOString();
    };

    const payload = {
      clientId: clientId || undefined,
      customerName: customerName.trim() || undefined,
      channel,
      deliveryDate: buildDeliveryISO(),
      paymentMethod,
      isPaid,
      notes: notes || undefined,
      discountAmount: Number(discountAmount),
      items: cleanItems.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity),
      })),
    };

    if (isEditing && order) {
      updateMutation.mutate(
        {
          orderId: order.id,
          data: {
            ...payload,
            clientId: clientId || null,
            customerName: customerName.trim() || null,
            deliveryDate: buildDeliveryISO() ?? null,
          },
        },
        { onSuccess: () => onCancelEdit?.() },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          resetForm();
          onCancelEdit?.();
        },
      });
    }
  };

  const labelStyle = { color: "var(--foreground-soft)" };

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        background: "var(--surface)",
        borderColor: isEditing ? "var(--warning)" : "var(--border)",
        boxShadow: isEditing
          ? "0 0 0 3px var(--warning-soft)"
          : "var(--shadow-lg)",
      }}
    >
      <div
        className="flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6"
        style={{
          borderColor: isEditing ? "var(--warning)" : "var(--border-soft)",
          background: isEditing ? "var(--warning-soft)" : "var(--surface-2)",
        }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              color: isEditing
                ? "var(--warning-text)"
                : "var(--foreground-muted)",
            }}
          >
            {isEditing ? "Editar pedido" : "Nuevo pedido"}
          </p>
          <h2
            className="mt-1 text-lg font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing ? "Actualizar pedido" : "Registrar pedido"}
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Cargá la información general y los productos del pedido.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancelEdit}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition"
          style={{
            borderColor: "var(--border)",
            background: "var(--background)",
            color: "var(--foreground-soft)",
          }}
          title="Cerrar"
        >
          <MdClose size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 p-5 md:p-6">
        <section className="space-y-4">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Datos generales
            </h3>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Cliente, canal, entrega y pago.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="ord-client"
                className="block text-sm font-medium"
                style={labelStyle}
              >
                Cliente existente
              </label>
              <select
                id="ord-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={fieldBase}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              >
                <option value="">Sin cliente asociado</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ord-customer-name"
                className="block text-sm font-medium"
                style={labelStyle}
              >
                Nombre del cliente
              </label>
              <input
                id="ord-customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej: Mauro / Cliente mostrador"
                className={fieldBase}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ord-channel"
                className="block text-sm font-medium"
                style={labelStyle}
              >
                Canal de venta
              </label>
              <select
                id="ord-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as OrderChannel)}
                className={fieldBase}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              >
                {CHANNEL_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ord-delivery-date"
                className="block text-sm font-medium"
                style={labelStyle}
              >
                Fecha de entrega
              </label>
              <input
                id="ord-delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={fieldBase}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              />
              <label
                className="flex cursor-pointer items-center gap-2 text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                <input
                  type="checkbox"
                  checked={hasDeliveryTime}
                  onChange={(e) => {
                    setHasDeliveryTime(e.target.checked);
                    if (!e.target.checked) setDeliveryTime("");
                  }}
                  className="h-3.5 w-3.5"
                />
                Especificar hora de entrega
              </label>
              {hasDeliveryTime && (
                <input
                  id="ord-delivery-time"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className={fieldBase}
                  style={fieldStyle(isEditing)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ord-payment-method"
                className="block text-sm font-medium"
                style={labelStyle}
              >
                Método de pago
              </label>
              <select
                id="ord-payment-method"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className={fieldBase}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              >
                {PAYMENT_METHOD_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={labelStyle}>
                Estado de pago
              </label>

              <label
                className="flex min-h-[46px] items-center gap-3 rounded-xl border px-4"
                style={{
                  background: "var(--background)",
                  borderColor: isPaid ? "var(--success)" : "var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="h-4 w-4"
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isPaid
                      ? "var(--success-text)"
                      : "var(--foreground-soft)",
                  }}
                >
                  {isPaid ? "Pagado" : "Pendiente de pago"}
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Productos del pedido
            </h3>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Agregá uno o más productos con su cantidad.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{
                borderColor: "var(--border-soft)",
                background: "var(--surface-2)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: "var(--foreground-muted)" }}
              >
                Ítems
              </p>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <MdAdd size={14} />
                Agregar producto
              </button>
            </div>

            <div className="space-y-3 p-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_120px_auto]"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--border-soft)",
                  }}
                >
                  <div className="space-y-1">
                    <label
                      className="block text-xs font-medium"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Producto
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, { productId: e.target.value })
                      }
                      className={smallFieldBase}
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    >
                      <option value="">Seleccionar producto…</option>
                      {products?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label
                      className="block text-xs font-medium"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, { quantity: Number(e.target.value) })
                      }
                      className={smallFieldBase}
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-30"
                      style={{
                        background: "var(--danger-soft)",
                        borderColor: "var(--danger)",
                        color: "var(--danger-text)",
                      }}
                      title="Quitar producto"
                    >
                      <MdRemove size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-1.5">
            <label
              htmlFor="ord-notes"
              className="block text-sm font-medium"
              style={labelStyle}
            >
              Notas
            </label>
            <textarea
              id="ord-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: Sin cebolla, entregar 20:30, llamar al llegar"
              className={`${fieldBase} resize-none`}
              style={fieldStyle(isEditing)}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ord-discount"
              className="block text-sm font-medium"
              style={labelStyle}
            >
              Descuento
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                $
              </span>
              <input
                id="ord-discount"
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                placeholder="0"
                className={`${fieldBase} pl-7`}
                style={fieldStyle(isEditing)}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
          </div>
        </section>



        {isError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--danger-soft)",
              borderColor: "var(--danger)",
              color: "var(--danger-text)",
            }}
          >
            {error instanceof Error
              ? error.message
              : "Error al procesar el pedido."}
          </div>
        )}

        {isSuccess && !isEditing && (
          <div
            className="rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--success-soft)",
              borderColor: "var(--success)",
              color: "var(--success-text)",
            }}
          >
            Pedido registrado correctamente.
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t pt-4 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground-soft)",
              background: "transparent",
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isPending || cleanItems.length === 0}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: isEditing ? "var(--warning)" : "var(--primary)",
              color: isEditing ? "#fff" : "var(--primary-foreground)",
            }}
          >
            {isPending
              ? isEditing
                ? "Guardando..."
                : "Registrando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
