import { useForm } from "react-hook-form";

import { useIngredients } from "../ingredients/use-ingredients";
import { useCreateRecipeItem } from "./use-recipes";

type FormData = {
  ingredientId: string;
  quantity: number;
  unit: "kg" | "g" | "l" | "ml" | "unit";
};

const UNIT_OPTIONS: { value: FormData["unit"]; label: string }[] = [
  { value: "g", label: "Gramo (g)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "l", label: "Litro (l)" },
  { value: "unit", label: "Unidad (u)" },
];

export function RecipeItemForm({ recipeId }: { recipeId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { unit: "g", quantity: 1 },
  });

  const { data: ingredients } = useIngredients();
  const mutation = useCreateRecipeItem();

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        recipeId,
        data: {
          ingredientId: data.ingredientId,
          quantity: Number(data.quantity),
          unit: data.unit,
        },
      },
      { onSuccess: () => reset({ unit: "g", quantity: 1 }) },
    );
  };

  /* ── estilos compartidos ──────────────────────────────────── */
  const fieldBase =
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition";
  const fieldStyle = (hasError?: boolean) => ({
    background: "var(--background)",
    borderColor: hasError ? "var(--danger)" : "var(--border)",
    color: "var(--foreground)",
  });
  const focusOn = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.target.style.borderColor = "var(--primary)";
    e.target.style.boxShadow = "0 0 0 3px var(--ring)";
  };
  const focusOff = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
    hasError?: boolean,
  ) => {
    e.target.style.borderColor = hasError ? "var(--danger)" : "var(--border)";
    e.target.style.boxShadow = "none";
  };

  const labelStyle = { color: "var(--foreground-soft)" };

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border-soft)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="border-b px-5 py-3"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foreground-muted)" }}
        >
          Agregar ingrediente
        </p>
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        {/* Fila: Ingrediente + Cantidad + Unidad + Botón */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_140px_auto]">
          {/* Ingrediente */}
          <div className="space-y-1.5">
            <label
              htmlFor="item-ingredient"
              className="block text-xs font-medium"
              style={labelStyle}
            >
              Ingrediente <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="item-ingredient"
              {...register("ingredientId", {
                required: "Seleccioná un ingrediente",
              })}
              className={fieldBase}
              style={fieldStyle(!!errors.ingredientId)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.ingredientId)}
            >
              <option value="">Seleccionar…</option>
              {ingredients?.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            {errors.ingredientId && (
              <p className="text-xs" style={{ color: "var(--danger-text)" }}>
                {errors.ingredientId.message}
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-1.5">
            <label
              htmlFor="item-quantity"
              className="block text-xs font-medium"
              style={labelStyle}
            >
              Cantidad <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              id="item-quantity"
              type="number"
              step="0.01"
              min="0"
              {...register("quantity", {
                valueAsNumber: true,
                required: "Obligatorio",
                min: { value: 0.01, message: "Debe ser > 0" },
              })}
              placeholder="250"
              className={fieldBase}
              style={fieldStyle(!!errors.quantity)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.quantity)}
            />
            {errors.quantity && (
              <p className="text-xs" style={{ color: "var(--danger-text)" }}>
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Unidad */}
          <div className="space-y-1.5">
            <label
              htmlFor="item-unit"
              className="block text-xs font-medium"
              style={labelStyle}
            >
              Unidad
            </label>
            <select
              id="item-unit"
              {...register("unit")}
              className={fieldBase}
              style={fieldStyle()}
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

          {/* Botón — alineado al fondo de la fila */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {mutation.isPending ? "Agregando…" : "Agregar"}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {mutation.isError && (
          <div
            className="mt-3 rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--danger-soft)",
              borderColor: "var(--danger)",
              color: "var(--danger-text)",
            }}
          >
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Error al agregar el ingrediente."}
          </div>
        )}
        {mutation.isSuccess && (
          <div
            className="mt-3 rounded-xl border px-4 py-3 text-sm animate-fade-in"
            style={{
              background: "var(--success-soft)",
              borderColor: "var(--success)",
              color: "var(--success-text)",
            }}
          >
            Ingrediente agregado correctamente.
          </div>
        )}
      </form>
    </div>
  );
}
