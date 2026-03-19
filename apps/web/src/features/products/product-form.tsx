import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

import type { Product } from "../../services/api/products.api";
import { useCategories } from "../categories/use-categories";
import { useCreateProduct, useUpdateProduct } from "./use-products";

/* ── tipos ──────────────────────────────────────────────────── */
type FormData = {
  categoryId: string;
  name: string;
  description?: string;
  kind: "prepared" | "resale" | "combo";
  unitPrice: number;
  halfDozenPrice?: number;
  dozenPrice?: number;
  directCost?: number;
};

type ProductFormProps = {
  product?: Product | null;
  onCancelEdit?: () => void;
};

/* ── helpers ────────────────────────────────────────────────── */
const KIND_OPTIONS = [
  { value: "prepared", label: "Preparado", desc: "Elaborado por el negocio" },
  { value: "resale", label: "Reventa", desc: "Comprado y revendido" },
  { value: "combo", label: "Combo", desc: "Combinación de productos" },
] as const;

const EMPTY_DEFAULTS: FormData = {
  categoryId: "",
  name: "",
  description: "",
  kind: "prepared",
  unitPrice: 0,
  halfDozenPrice: 0,
  dozenPrice: 0,
  directCost: 0,
};

/* ── componente ─────────────────────────────────────────────── */
export function ProductForm({ product, onCancelEdit }: ProductFormProps) {
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: EMPTY_DEFAULTS });

  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const kind = watch("kind");
  const isPrepared = kind === "prepared";
  const needsDirectCost = kind === "resale" || kind === "combo";

  const currentMutation = isEditing ? updateMutation : createMutation;
  const isPending = currentMutation.isPending;
  const isError = currentMutation.isError;
  const isSuccess = currentMutation.isSuccess;

  const errorMessage = useMemo(() => {
    if (currentMutation.error instanceof Error)
      return currentMutation.error.message;
    return isEditing
      ? "Error al editar el producto."
      : "Error al crear el producto.";
  }, [currentMutation.error, isEditing]);

  /* reset on product change */
  useEffect(() => {
    if (product) {
      reset({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description ?? "",
        kind: product.kind,
        unitPrice: product.unitPrice,
        halfDozenPrice: product.halfDozenPrice ?? 0,
        dozenPrice: product.dozenPrice ?? 0,
        directCost: product.directCost ?? 0,
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [product, reset]);

  /* submit */
  const onSubmit = (data: FormData) => {
    const payload = {
      categoryId: data.categoryId,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      kind: data.kind,
      unitPrice: Number(data.unitPrice),
      halfDozenPrice:
        isPrepared && data.halfDozenPrice && data.halfDozenPrice > 0
          ? Number(data.halfDozenPrice)
          : undefined,
      dozenPrice:
        isPrepared && data.dozenPrice && data.dozenPrice > 0
          ? Number(data.dozenPrice)
          : undefined,
      directCost:
        needsDirectCost && data.directCost !== undefined && data.directCost > 0
          ? Number(data.directCost)
          : undefined,
    };

    if (isEditing && product) {
      updateMutation.mutate(
        { productId: product.id, data: payload },
        { onSuccess: () => onCancelEdit?.() },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => reset(EMPTY_DEFAULTS),
      });
    }
  };

  /* ── estilos compartidos ──────────────────────────────────── */
  const fieldBase =
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition";
  const fieldStyle = (hasError?: boolean) => ({
    background: "var(--background)",
    borderColor: hasError ? "var(--danger)" : "var(--border)",
    color: "var(--foreground)",
  });
  const focusOn = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    e.target.style.borderColor = isEditing
      ? "var(--warning)"
      : "var(--primary)";
    e.target.style.boxShadow = `0 0 0 3px ${isEditing ? "var(--warning-soft)" : "var(--ring)"}`;
  };
  const focusOff = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    hasError?: boolean,
  ) => {
    e.target.style.borderColor = hasError ? "var(--danger)" : "var(--border)";
    e.target.style.boxShadow = "none";
  };

  const labelCls = "block text-sm font-medium mb-1.5";
  const labelStyle = { color: "var(--foreground-soft)" };
  const errorEl = (msg?: string) =>
    msg ? (
      <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
        {msg}
      </p>
    ) : null;

  const moneyField = (
    id: string,
    fieldName: keyof FormData,
    label: string,
    placeholder: string,
    required?: boolean,
  ) => (
    <div>
      <label htmlFor={id} className={labelCls} style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "var(--foreground-muted)" }}
        >
          $
        </span>
        <input
          id={id}
          type="number"
          step="0.01"
          min="0"
          {...register(fieldName, {
            valueAsNumber: true,
            ...(required
              ? {
                  required: "Campo obligatorio",
                  min: { value: 0.01, message: "Debe ser mayor a 0" },
                }
              : {}),
          })}
          placeholder={placeholder}
          className={`${fieldBase} pl-7`}
          style={fieldStyle(!!(errors as Record<string, unknown>)[fieldName])}
          onFocus={focusOn}
          onBlur={(e) =>
            focusOff(e, !!(errors as Record<string, unknown>)[fieldName])
          }
        />
      </div>
      {errorEl(
        (errors as Record<string, { message?: string }>)[fieldName]?.message,
      )}
    </div>
  );

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all"
      style={{
        background: "var(--surface)",
        borderColor: isEditing ? "var(--warning)" : "var(--border)",
        boxShadow: isEditing
          ? "0 0 0 3px var(--warning-soft)"
          : "var(--shadow-sm)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{
          borderColor: isEditing ? "var(--warning)" : "var(--border-soft)",
          background: isEditing ? "var(--warning-soft)" : "var(--surface-2)",
        }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{
              color: isEditing
                ? "var(--warning-text)"
                : "var(--foreground-muted)",
            }}
          >
            {isEditing ? "Editando producto" : "Nuevo producto"}
          </p>
          <h2
            className="mt-0.5 text-base font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing ? product!.name : "Registrar producto"}
          </h2>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg p-1.5 transition"
            style={{ color: "var(--warning-text)" }}
            title="Cancelar edición"
          >
            <MdClose size={18} />
          </button>
        )}
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5">
        {/* Fila 1: Categoría + Nombre */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prod-cat" className={labelCls} style={labelStyle}>
              Categoría <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="prod-cat"
              {...register("categoryId", {
                required: "Seleccioná una categoría",
              })}
              className={fieldBase}
              style={fieldStyle(!!errors.categoryId)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.categoryId)}
            >
              <option value="">Seleccionar…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errorEl(errors.categoryId?.message)}
          </div>

          <div>
            <label htmlFor="prod-name" className={labelCls} style={labelStyle}>
              Nombre <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              id="prod-name"
              {...register("name", { required: "Ingresá un nombre" })}
              placeholder="Ej: Empanada de jamón y queso"
              className={fieldBase}
              style={fieldStyle(!!errors.name)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.name)}
            />
            {errorEl(errors.name?.message)}
          </div>
        </div>

        {/* Fila 2: Descripción + Tipo */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="prod-desc" className={labelCls} style={labelStyle}>
              Descripción{" "}
              <span
                className="text-xs font-normal"
                style={{ color: "var(--foreground-muted)" }}
              >
                (opcional)
              </span>
            </label>
            <textarea
              id="prod-desc"
              {...register("description")}
              rows={2}
              placeholder="Ej: Horneable, apta para freezar"
              className={`${fieldBase} resize-none`}
              style={fieldStyle()}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e)}
            />
          </div>

          <div>
            <label htmlFor="prod-kind" className={labelCls} style={labelStyle}>
              Tipo de producto <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="prod-kind"
              {...register("kind")}
              className={fieldBase}
              style={fieldStyle()}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e)}
            >
              {KIND_OPTIONS.map(({ value, label, desc }) => (
                <option key={value} value={value}>
                  {label} — {desc}
                </option>
              ))}
            </select>

            {/* Chip tipo activo */}
            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={
                  kind === "prepared"
                    ? {
                        background: "var(--info-soft)",
                        color: "var(--info-text)",
                      }
                    : kind === "resale"
                      ? {
                          background: "var(--success-soft)",
                          color: "var(--success-text)",
                        }
                      : {
                          background: "var(--warning-soft)",
                          color: "var(--warning-text)",
                        }
                }
              >
                {KIND_OPTIONS.find((o) => o.value === kind)?.label}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                {KIND_OPTIONS.find((o) => o.value === kind)?.desc}
                {isPrepared
                  ? " · puede tener precio por media docena y docena"
                  : " · requiere costo directo"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-5 border-t"
          style={{ borderColor: "var(--border-soft)" }}
        />

        {/* Fila 3: Precios */}
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--foreground-muted)" }}
        >
          Precios de venta
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {moneyField(
            "prod-unit-price",
            "unitPrice",
            "Por unidad",
            "1.500",
            true,
          )}

          {isPrepared && (
            <>
              {moneyField(
                "prod-half-dozen",
                "halfDozenPrice",
                "Media docena",
                "8.500",
              )}
              {moneyField("prod-dozen", "dozenPrice", "Docena", "15.000")}
            </>
          )}
        </div>

        {/* Costo directo — solo resale/combo */}
        {needsDirectCost && (
          <>
            <div
              className="my-5 border-t"
              style={{ borderColor: "var(--border-soft)" }}
            />
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--foreground-muted)" }}
            >
              Costo
            </p>
            <div className="max-w-xs">
              {moneyField(
                "prod-direct-cost",
                "directCost",
                "Costo directo por unidad",
                "900",
                needsDirectCost,
              )}
            </div>
          </>
        )}

        {/* Feedback */}
        {isError && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--danger-soft)",
              borderColor: "var(--danger)",
              color: "var(--danger-text)",
            }}
          >
            {errorMessage}
          </div>
        )}
        {isSuccess && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--success-soft)",
              borderColor: "var(--success)",
              color: "var(--success-text)",
            }}
          >
            {isEditing
              ? "Producto actualizado correctamente."
              : "Producto registrado correctamente."}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-5 flex gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground-muted)",
                background: "transparent",
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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
                : "Registrar producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
