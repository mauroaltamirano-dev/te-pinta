import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { format, parseISO } from "date-fns";

import { useIngredients } from "../ingredients/use-ingredients";
import {
  useCreatePurchase,
  usePurchaseById,
  useUpdatePurchase,
} from "./use-purchases";

registerLocale("es", es);

type FormData = {
  date: string;
  type: "ingredient" | "operational" | "investment";
  ingredientId?: string;
  nameSnapshot: string;
  quantity?: number;
  unit?: "kg" | "g" | "l" | "ml" | "unit";
  unitPrice?: number;
  totalAmount: number;
  supplier?: string;
  notes?: string;
};

const TYPE_LABELS: Record<FormData["type"], string> = {
  ingredient: "Ingrediente / insumo",
  operational: "Gasto operativo",
  investment: "Inversión / capital",
};

const UNIT_LABELS: Record<string, string> = {
  kg: "Kilogramo (kg)",
  g: "Gramo (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
  unit: "Unidad (u)",
};

const fieldClassName =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition";

const baseFieldStyle: React.CSSProperties = {
  background: "var(--background)",
  borderColor: "var(--border)",
  color: "var(--foreground)",
};

export function PurchaseForm({
  purchaseId,
  onCancel,
}: {
  purchaseId?: string | null;
  onCancel?: () => void;
}) {
  const { data: ingredients } = useIngredients();
  const createMutation = useCreatePurchase();
  const updateMutation = useUpdatePurchase();
  const { data: purchase, isLoading: isPurchaseLoading } = usePurchaseById(
    purchaseId ?? "",
  );

  const isEditing = !!purchaseId;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const error = createMutation.error || updateMutation.error;

  const { register, handleSubmit, watch, reset, setValue, control } =
    useForm<FormData>({
      defaultValues: {
        date: format(new Date(), "yyyy-MM-dd"),
        type: "ingredient",
        unit: "kg",
        totalAmount: 0,
        quantity: 1,
        unitPrice: 0,
        nameSnapshot: "",
        ingredientId: "",
        supplier: "",
        notes: "",
      },
    });

  useEffect(() => {
    if (purchase) {
      reset({
        date: purchase.date,
        type: purchase.type,
        ingredientId: purchase.ingredientId ?? "",
        nameSnapshot: purchase.nameSnapshot,
        quantity: purchase.quantity ?? 1,
        unit: (purchase.unit as FormData["unit"]) ?? "kg",
        unitPrice: purchase.unitPrice ?? 0,
        totalAmount: purchase.totalAmount,
        supplier: purchase.supplier ?? "",
        notes: purchase.notes ?? "",
      });
    } else if (!purchaseId) {
      reset({
        date: format(new Date(), "yyyy-MM-dd"),
        type: "ingredient",
        unit: "kg",
        totalAmount: 0,
        quantity: 1,
        unitPrice: 0,
        nameSnapshot: "",
        ingredientId: "",
        supplier: "",
        notes: "",
      });
    }
  }, [purchase, purchaseId, reset]);

  const type = watch("type");
  const ingredientId = watch("ingredientId");
  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  const isIngredient = type === "ingredient";

  const selectedIngredient = useMemo(
    () => ingredients?.find((ingredient) => ingredient.id === ingredientId),
    [ingredients, ingredientId],
  );

  const handleQuantityOrPriceChange = (
    nextQuantity?: number,
    nextUnitPrice?: number,
  ) => {
    const qty = nextQuantity ?? quantity ?? 0;
    const price = nextUnitPrice ?? unitPrice ?? 0;
    setValue("totalAmount", qty * price);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      date: data.date,
      type: data.type,
      ingredientId: isIngredient ? data.ingredientId || undefined : undefined,
      nameSnapshot:
        isIngredient && selectedIngredient
          ? selectedIngredient.name
          : data.nameSnapshot,
      quantity: isIngredient ? Number(data.quantity) : undefined,
      unit: isIngredient ? data.unit : undefined,
      unitPrice: isIngredient ? Number(data.unitPrice) : undefined,
      totalAmount: Number(data.totalAmount),
      supplier: data.supplier || undefined,
      notes: data.notes || undefined,
    };

    if (isEditing && purchase) {
      updateMutation.mutate(
        { id: purchase.id, data: payload },
        {
          onSuccess: () => {
            onCancel?.();
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          reset({
            date: format(new Date(), "yyyy-MM-dd"),
            type: "ingredient",
            unit: "kg",
            totalAmount: 0,
            quantity: 1,
            unitPrice: 0,
          });
          onCancel?.();
        },
      });
    }
  };

  const handleIngredientChange = (value: string) => {
    setValue("ingredientId", value);

    const ingredient = ingredients?.find((item) => item.id === value);

    if (ingredient) {
      setValue("nameSnapshot", ingredient.name);
      setValue("unit", ingredient.unit as FormData["unit"]);
      setValue("unitPrice", ingredient.currentCost);
      const nextQuantity = quantity || 1;
      setValue("totalAmount", nextQuantity * ingredient.currentCost);
    }
  };

  if (isEditing && isPurchaseLoading) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--foreground-muted)" }}>
        Cargando datos de la compra...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col"
      style={{
        background: "var(--surface)",
        color: "var(--foreground)",
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="shrink-0 border-b px-5 py-4 md:px-6"
        style={{
          background: isEditing ? "var(--warning-soft)" : "var(--surface-2)",
          borderColor: isEditing ? "var(--warning)" : "var(--border-soft)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{
            color: isEditing
              ? "var(--warning-text)"
              : "var(--foreground-muted)",
          }}
        >
          {isEditing ? "Editar compra" : "Nueva compra"}
        </p>
        <h2
          className="mt-1 text-lg font-bold"
          style={{
            color: isEditing ? "var(--warning-text)" : "var(--foreground)",
          }}
        >
          {isEditing ? "Actualizar compra o gasto" : "Registrar compra o gasto"}
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--foreground-muted)" }}
        >
          {isEditing
            ? "Modificá los datos de la compra."
            : "Registrá una compra de ingrediente, un gasto operativo o una inversión."}
        </p>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 p-5 md:p-6">
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
              Fecha, tipo de registro y referencia principal.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--foreground-soft)" }}
              >
                Fecha de la compra
              </label>

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    selected={field.value ? parseISO(field.value) : null}
                    onChange={(date: Date | null) =>
                      field.onChange(
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    className={fieldClassName}
                    wrapperClassName="w-full"
                    placeholderText="dd/mm/aaaa"
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="purchase-type"
                className="text-sm font-medium"
                style={{ color: "var(--foreground-soft)" }}
              >
                Tipo de compra o gasto
              </label>

              <select
                id="purchase-type"
                {...register("type")}
                className={fieldClassName}
                style={baseFieldStyle}
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {isIngredient ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-ingredient"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Ingrediente
                </label>

                <select
                  id="purchase-ingredient"
                  value={ingredientId || ""}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className={fieldClassName}
                  style={baseFieldStyle}
                >
                  <option value="">Seleccionar ingrediente</option>
                  {ingredients?.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-name"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Descripción del gasto
                </label>

                <input
                  id="purchase-name"
                  {...register("nameSnapshot")}
                  placeholder="Ej: Factura de gas de marzo"
                  className={fieldClassName}
                  style={baseFieldStyle}
                />
              </div>
            )}
          </div>
        </section>

        {isIngredient ? (
          <section className="space-y-4">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Detalle del insumo
              </h3>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                Cantidad, unidad y precio de compra.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-quantity"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Cantidad
                </label>
                <input
                  id="purchase-quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("quantity", { valueAsNumber: true })}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setValue("quantity", value);
                    handleQuantityOrPriceChange(value, undefined);
                  }}
                  placeholder="Ej: 25"
                  className={fieldClassName}
                  style={baseFieldStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-unit"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Unidad de medida
                </label>
                <select
                  id="purchase-unit"
                  {...register("unit")}
                  className={fieldClassName}
                  style={baseFieldStyle}
                >
                  {Object.entries(UNIT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-unit-price"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Precio por unidad
                </label>
                <input
                  id="purchase-unit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("unitPrice", { valueAsNumber: true })}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setValue("unitPrice", value);
                    handleQuantityOrPriceChange(undefined, value);
                  }}
                  placeholder="Ej: 850"
                  className={fieldClassName}
                  style={baseFieldStyle}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Información económica
            </h3>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Total, proveedor y notas adicionales.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="purchase-total"
                className="text-sm font-medium"
                style={{ color: "var(--foreground-soft)" }}
              >
                Total pagado
              </label>
              <input
                id="purchase-total"
                type="number"
                step="0.01"
                min="0"
                {...register("totalAmount", { valueAsNumber: true })}
                placeholder="Ej: 21250"
                className={fieldClassName}
                style={baseFieldStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="purchase-supplier"
                className="text-sm font-medium"
                style={{ color: "var(--foreground-soft)" }}
              >
                Proveedor
              </label>
              <input
                id="purchase-supplier"
                {...register("supplier")}
                placeholder="Ej: Distribuidora El Trigal"
                className={fieldClassName}
                style={baseFieldStyle}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="purchase-notes"
                className="text-sm font-medium"
                style={{ color: "var(--foreground-soft)" }}
              >
                Notas
              </label>
              <textarea
                id="purchase-notes"
                {...register("notes")}
                rows={3}
                placeholder="Ej: Precio por flete incluido"
                className={`${fieldClassName} resize-none`}
                style={baseFieldStyle}
              />
            </div>
          </div>
        </section>

        {error ? (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--danger-soft)",
              borderColor: "var(--danger)",
              color: "var(--danger)",
            }}
          >
            {error instanceof Error
              ? error.message
              : "Ocurrió un error al guardar la compra"}
          </div>
        ) : null}

        {isSuccess ? (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--success-soft)",
              borderColor: "var(--success)",
              color: "var(--success)",
            }}
          >
            Compra {isEditing ? "actualizada" : "registrada"} correctamente.
          </div>
        ) : null}
      </div>

      {/* ── Footer Pegajoso ───────────────────────────────────── */}
      <div
        className="shrink-0 border-t p-5 md:p-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-soft)",
        }}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: "var(--border)",
              background: "transparent",
              color: "var(--foreground-soft)",
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: isEditing ? "var(--warning)" : "var(--primary)",
              color: isEditing ? "#fff" : "var(--primary-foreground)",
            }}
            disabled={isPending}
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar compra"}
          </button>
        </div>
      </div>
    </form>
  );
}
