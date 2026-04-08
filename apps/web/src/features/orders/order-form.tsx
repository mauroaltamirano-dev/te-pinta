import { useMemo, useState } from "react";
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



const EMPTY_ITEM: OrderFormItem = { productId: "", quantity: 1 };

const fieldBase =
  "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition";
const smallFieldBase =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition";

const fieldStyle = (isEditing: boolean, hasError = false) => ({
  background: "var(--background)",
  borderColor: hasError
    ? "var(--danger)"
    : isEditing
      ? "var(--warning)"
      : "var(--border)",
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
  const [clientMode, setClientMode] = useState<"existing" | "manual">("existing");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
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
  const [prevOrderId, setPrevOrderId] = useState<string | undefined>(order?.id);

  const resetForm = () => {
    setClientId("");
    setClientMode("existing");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
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

  if (order?.id !== prevOrderId) {
    setPrevOrderId(order?.id);
    if (!order) {
      setLoadedOrderId(null);
      resetForm();
    }
  }

  if (
    order &&
    detailQuery.data &&
    detailQuery.data.id === order.id &&
    loadedOrderId !== order.id
  ) {
    setLoadedOrderId(order.id);
    const resolvedClientId = detailQuery.data.clientId ?? "";
    setClientId(resolvedClientId);
    setClientMode(resolvedClientId ? "existing" : "manual");
    setCustomerName(detailQuery.data.customerNameSnapshot ?? "");
    setCustomerPhone(detailQuery.data.customerPhoneSnapshot ?? "");
    setCustomerAddress(detailQuery.data.customerAddressSnapshot ?? "");
    setChannel(detailQuery.data.channel);
    const raw = detailQuery.data.deliveryDate;
    if (raw) {
      const d = new Date(raw);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setDeliveryDate(`${year}-${month}-${day}`);
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
      clientId: clientMode === "existing" && clientId ? clientId : undefined,
      customerName: customerName.trim() ? customerName.trim() : undefined,
      customerPhone: customerPhone.trim() ? customerPhone.trim() : undefined,
      customerAddress: customerAddress.trim() ? customerAddress.trim() : undefined,
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
            clientId: clientMode === "existing" && clientId ? clientId : null,
            customerName: customerName.trim() ? customerName.trim() : null,
            customerPhone: customerPhone.trim() ? customerPhone.trim() : null,
            customerAddress: customerAddress.trim() ? customerAddress.trim() : null,
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
    <div className="flex h-full flex-col text-sm">
      <div
        className="shrink-0 flex items-start justify-between gap-4 border-b px-5 py-4 md:px-6"
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

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8">
        <section className="space-y-4">
          <div className="rounded-xl border p-5 space-y-5" style={{ borderColor: 'var(--border-soft)', background: 'var(--surface-2)' }}>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Cliente</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--foreground-muted)" }}>
                Seleccioná un cliente o ingresá uno nuevo.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-1 rounded-xl p-1 border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setClientMode("existing")}
                className="rounded-lg py-2 text-sm font-semibold transition"
                style={{
                  background: clientMode === "existing" ? "var(--surface)" : "transparent",
                  color: clientMode === "existing" ? "var(--foreground)" : "var(--foreground-muted)",
                  boxShadow: clientMode === "existing" ? "var(--shadow-app-sm)" : "none",
                }}
              >
                Cliente Existente
              </button>
              <button
                type="button"
                onClick={() => {
                   setClientMode("manual");
                   setClientId("");
                }}
                className="rounded-lg py-2 text-sm font-semibold transition"
                style={{
                  background: clientMode === "manual" ? "var(--surface)" : "transparent",
                  color: clientMode === "manual" ? "var(--foreground)" : "var(--foreground-muted)",
                  boxShadow: clientMode === "manual" ? "var(--shadow-app-sm)" : "none",
                }}
              >
                Nuevo / Manual
              </button>
            </div>

            {clientMode === "existing" ? (
              <div className="space-y-3">
                <p className="text-xs p-3 rounded-lg border font-medium" style={{ color: "var(--info-text)", background: "var(--info-soft)", borderColor: "var(--info)" }}>
                  Seleccioná un cliente ya registrado para autocompletar sus datos.
                </p>
                <select
                  id="ord-client"
                  value={clientId}
                  onChange={(e) => {
                     const id = e.target.value;
                     setClientId(id);
                     if (id) {
                       const c = clients?.find(x => x.id === id);
                       if (c) {
                         setCustomerName(c.name);
                         setCustomerPhone(c.phone || "");
                         setCustomerAddress(c.address || "");
                       }
                     } else {
                       setCustomerName("");
                       setCustomerPhone("");
                       setCustomerAddress("");
                     }
                  }}
                  className={fieldBase}
                  style={fieldStyle(isEditing)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `— ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs p-3 rounded-lg border font-medium" style={{ color: "var(--info-text)", background: "var(--info-soft)", borderColor: "var(--info)" }}>
                  Si completás estos datos y el cliente no existe, se registrará automáticamente al guardar el pedido.
                </p>
              </div>
            )}

            <div className={`grid gap-4 ${clientMode === "existing" && !clientId ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="space-y-1.5">
                <label htmlFor="ord-customer-name" className="block text-sm font-medium" style={labelStyle}>
                  Nombre del cliente
                </label>
                <input
                  id="ord-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Consumidor Final"
                  className={fieldBase}
                  style={fieldStyle(isEditing)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="ord-customer-phone" className="block text-sm font-medium" style={labelStyle}>
                    Teléfono
                  </label>
                  <input
                    id="ord-customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: +54 9 11..."
                    className={fieldBase}
                    style={fieldStyle(isEditing)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ord-customer-address" className="block text-sm font-medium" style={labelStyle}>
                    Dirección
                  </label>
                  <input
                    id="ord-customer-address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ej: Calle falsa 123"
                    className={fieldBase}
                    style={fieldStyle(isEditing)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-semibold mt-6"
              style={{ color: "var(--foreground)" }}
            >
              Detalles del pedido
            </h3>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Canal, entrega y pago.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

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
              <label className="block text-sm font-medium" style={labelStyle}>
                Método de pago
              </label>

              <div 
                className="grid grid-cols-2 gap-1 rounded-xl p-1 border"
                style={{ 
                  background: "var(--background)", 
                  borderColor: "var(--border)" 
                }}
              >
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className="rounded-lg py-2 text-sm font-semibold transition"
                  style={{
                    background: paymentMethod === "cash" ? "var(--surface)" : "transparent",
                    color: paymentMethod === "cash" ? "var(--foreground)" : "var(--foreground-muted)",
                    boxShadow: paymentMethod === "cash" ? "var(--shadow-app-sm)" : "none",
                  }}
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className="rounded-lg py-2 text-sm font-semibold transition"
                  style={{
                    background: paymentMethod === "transfer" ? "var(--surface)" : "transparent",
                    color: paymentMethod === "transfer" ? "var(--foreground)" : "var(--foreground-muted)",
                    boxShadow: paymentMethod === "transfer" ? "var(--shadow-app-sm)" : "none",
                  }}
                >
                  Transferencia
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={labelStyle}>
                Estado de pago
              </label>

              <div 
                className="grid grid-cols-2 gap-1 rounded-xl p-1 border"
                style={{ 
                  background: "var(--background)", 
                  borderColor: "var(--border)" 
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className="rounded-lg py-2 text-sm font-semibold transition"
                  style={{
                    background: isPaid ? "var(--success)" : "transparent",
                    color: isPaid ? "#fff" : "var(--foreground-muted)",
                    boxShadow: isPaid ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Pagado
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className="rounded-lg py-2 text-sm font-semibold transition"
                  style={{
                    background: !isPaid ? "var(--surface)" : "transparent",
                    color: !isPaid ? "var(--foreground)" : "var(--foreground-muted)",
                    boxShadow: !isPaid ? "var(--shadow-app-sm)" : "none",
                  }}
                >
                  Pendiente
                </button>
              </div>
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
        </div>

        {/* Footer */}
        <div
          className="shrink-0 border-t p-5 md:px-6"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--surface)",
          }}
        >
          <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
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
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </form>
    </div>
  );
}
