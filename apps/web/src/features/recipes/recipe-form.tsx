import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

import type { Recipe } from "../../services/api/recipes.api";
import { useProducts } from "../products/use-products";
import { useCreateRecipe, useUpdateRecipe } from "./use-recipes";

type FormData = {
  productId: string;
  yieldQuantity: number;
  notes?: string;
};

type RecipeFormProps = {
  recipe?: Recipe | null;
  onCancelEdit?: () => void;
  onSuccessCreate?: (productId: string) => void;
};

export function RecipeForm({ recipe, onCancelEdit, onSuccessCreate }: RecipeFormProps) {
  const isEditing = !!recipe;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      productId: recipe?.productId ?? "",
      yieldQuantity: recipe?.yieldQuantity ?? 1,
      notes: recipe?.notes ?? "",
    },
  });

  const { data: products } = useProducts({ includeInactive: true });
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const isSuccess = createMutation.isSuccess;

  const preparedProducts = products?.filter((p) => p.kind === "prepared");

  useEffect(() => {
    reset({
      productId: recipe?.productId ?? "",
      yieldQuantity: recipe?.yieldQuantity ?? 1,
      notes: recipe?.notes ?? "",
    });
  }, [recipe, reset]);

  const onSubmit = (data: FormData) => {
    if (isEditing && recipe) {
      updateMutation.mutate(
        {
          recipeId: recipe.id,
          data: {
            yieldQuantity: Number(data.yieldQuantity),
            notes: data.notes,
          },
        },
        { onSuccess: () => onCancelEdit?.() },
      );
      return;
    }

    createMutation.mutate(
      {
        productId: data.productId,
        yieldQuantity: Number(data.yieldQuantity),
        notes: data.notes,
      },
      {
        onSuccess: () => {
          const selectedProductId = data.productId;
          reset({ productId: "", yieldQuantity: 1, notes: "" });
          onSuccessCreate?.(selectedProductId);
          onCancelEdit?.();
        },
      },
    );
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

  const labelStyle = { color: "var(--foreground-soft)" };

  return (
    <div className="flex h-full flex-col text-sm transition-colors">
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between border-b px-5 py-4"
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
            {isEditing ? "Editando receta" : "Nueva receta"}
          </p>
          <h2
            className="mt-0.5 text-base font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing
              ? `Rendimiento: ${recipe.yieldQuantity} u.`
              : "Crear receta"}
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 p-5">
        {/* Producto — solo al crear */}
        {!isEditing && (
          <div className="space-y-1.5">
            <label
              htmlFor="recipe-product"
              className="block text-sm font-medium"
              style={labelStyle}
            >
              Producto preparado{" "}
              <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              id="recipe-product"
              {...register("productId", { required: "Seleccioná un producto" })}
              className={fieldBase}
              style={fieldStyle(!!errors.productId)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.productId)}
            >
              <option value="">Seleccionar producto…</option>
              {preparedProducts?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs" style={{ color: "var(--danger-text)" }}>
                {errors.productId.message}
              </p>
            )}
          </div>
        )}

        {/* Rendimiento + Notas en fila */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="recipe-yield"
              className="block text-sm font-medium"
              style={labelStyle}
            >
              Rendimiento (unidades){" "}
              <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              id="recipe-yield"
              type="number"
              step="1"
              min="1"
              {...register("yieldQuantity", {
                valueAsNumber: true,
                required: "Ingresá el rendimiento",
                min: { value: 1, message: "Mínimo 1 unidad" },
              })}
              placeholder="Ej: 12"
              className={fieldBase}
              style={fieldStyle(!!errors.yieldQuantity)}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e, !!errors.yieldQuantity)}
            />
            {errors.yieldQuantity && (
              <p className="text-xs" style={{ color: "var(--danger-text)" }}>
                {errors.yieldQuantity.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="recipe-notes"
              className="block text-sm font-medium"
              style={labelStyle}
            >
              Notas{" "}
              <span
                className="text-xs font-normal"
                style={{ color: "var(--foreground-muted)" }}
              >
                (opcional)
              </span>
            </label>
            <textarea
              id="recipe-notes"
              {...register("notes")}
              rows={2}
              placeholder="Ej: Hornear a 180° por 25 min"
              className={`${fieldBase} resize-none`}
              style={fieldStyle()}
              onFocus={focusOn}
              onBlur={(e) => focusOff(e)}
            />
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
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : updateMutation.error instanceof Error
                ? updateMutation.error.message
                : isEditing
                  ? "Error al guardar los cambios."
                  : "Error al crear la receta."}
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
            Receta creada. Ahora podés agregar los ingredientes.
          </div>
        )}

        {/* Acciones */}
        </div>
        
        <div
          className="shrink-0 border-t p-5"
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
                color: "var(--foreground-muted)",
                background: "transparent",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isEditing ? "var(--warning)" : "var(--primary)",
                color: isEditing ? "#fff" : "var(--primary-foreground)",
              }}
            >
              {isPending
                ? isEditing
                  ? "Guardando..."
                  : "Creando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear receta"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
