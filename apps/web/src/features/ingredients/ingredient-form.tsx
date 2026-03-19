import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

import type { Ingredient } from "../../services/api/ingredients.api";
import { useCreateIngredient, useUpdateIngredient } from "./use-ingredients";

type FormData = {
  name: string;
  description?: string;
  unit: "kg" | "g" | "l" | "ml" | "unit";
  currentCost: number;
};

const UNIT_OPTIONS: { value: FormData["unit"]; label: string }[] = [
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "g", label: "Gramo (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "unit", label: "Unidad (u)" },
];

type IngredientFormProps = {
  ingredient?: Ingredient | null;
  onCancelEdit?: () => void;
};

export function IngredientForm({
  ingredient,
  onCancelEdit,
}: IngredientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: ingredient?.name ?? "",
      description: ingredient?.description ?? "",
      unit: ingredient?.unit ?? "kg",
      currentCost: ingredient?.currentCost ?? 0,
    },
  });

  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();

  const isEditing = !!ingredient;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  const errorMessage =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : isEditing
          ? "Error al editar el ingrediente."
          : "Error al crear el ingrediente.";

  useEffect(() => {
    reset({
      name: ingredient?.name ?? "",
      description: ingredient?.description ?? "",
      unit: ingredient?.unit ?? "kg",
      currentCost: ingredient?.currentCost ?? 0,
    });
  }, [ingredient, reset]);

  const onSubmit = (data: FormData) => {
    const payload = { ...data, currentCost: Number(data.currentCost) };
    if (isEditing) {
      updateMutation.mutate({ id: ingredient.id, data: payload });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => reset({ unit: "kg", currentCost: 0 }),
      });
    }
  };

  /* ── helpers de estilo ──────────────────────────────────── */
  const inputStyle = (hasError?: boolean) => ({
    background: "var(--background)",
    borderColor: hasError ? "var(--danger)" : "var(--border)",
    color: "var(--foreground)",
  });

  const focusOn = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.borderColor = isEditing
      ? "var(--warning)"
      : "var(--primary)";
    e.target.style.boxShadow = `0 0 0 3px ${isEditing ? "var(--warning-soft)" : "var(--ring)"}`;
  };
  const focusOff = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
    hasError?: boolean,
  ) => {
    e.target.style.borderColor = hasError ? "var(--danger)" : "var(--border)";
    e.target.style.boxShadow = "none";
  };

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
            {isEditing ? "Editando" : "Nuevo ingrediente"}
          </p>
          <h2
            className="mt-0.5 text-base font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing ? ingredient.name : "Registrar ingrediente"}
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

      {/* ── Campos ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label
            htmlFor="ing-name"
            className="text-sm font-medium"
            style={{ color: "var(--foreground-soft)" }}
          >
            Nombre <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="ing-name"
            {...register("name", { required: "El nombre es obligatorio" })}
            placeholder="Ej: Harina 000"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
            style={inputStyle(!!errors.name)}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e, !!errors.name)}
          />
          {errors.name && (
            <p className="text-xs" style={{ color: "var(--danger-text)" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label
            htmlFor="ing-desc"
            className="text-sm font-medium"
            style={{ color: "var(--foreground-soft)" }}
          >
            Descripción{" "}
            <span
              className="text-xs font-normal"
              style={{ color: "var(--foreground-muted)" }}
            >
              (opcional)
            </span>
          </label>
          <input
            id="ing-desc"
            {...register("description")}
            placeholder="Ej: Harina 000 de trigo, bolsa de 25 kg"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
            style={inputStyle()}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e)}
          />
        </div>

        {/* Unidad + Costo — fila */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="ing-unit"
              className="text-sm font-medium"
              style={{ color: "var(--foreground-soft)" }}
            >
              Unidad <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="ing-unit"
              {...register("unit")}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition"
              style={inputStyle()}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e)}
            >
              {UNIT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="ing-cost"
              className="text-sm font-medium"
              style={{ color: "var(--foreground-soft)" }}
            >
              Costo por unidad <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                $
              </span>
              <input
                id="ing-cost"
                type="number"
                step="0.01"
                min="0"
                {...register("currentCost", {
                  valueAsNumber: true,
                  required: "El costo es obligatorio",
                  min: { value: 0, message: "Debe ser ≥ 0" },
                })}
                placeholder="850"
                className="w-full rounded-xl border py-2.5 pl-7 pr-4 text-sm outline-none transition"
                style={inputStyle(!!errors.currentCost)}
                onFocus={focusOn}
                onBlur={(e) => focusOff(e, !!errors.currentCost)}
              />
            </div>
            {errors.currentCost && (
              <p className="text-xs" style={{ color: "var(--danger-text)" }}>
                {errors.currentCost.message}
              </p>
            )}
          </div>
        </div>

        {/* Feedback */}
        {isError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm animate-fade-in"
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
            className="rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--success-soft)",
              borderColor: "var(--success)",
              color: "var(--success-text)",
            }}
          >
            {isEditing
              ? "Ingrediente actualizado correctamente."
              : "Ingrediente registrado correctamente."}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
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
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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
                : "Registrar ingrediente"}
          </button>
        </div>
      </form>
    </div>
  );
}
