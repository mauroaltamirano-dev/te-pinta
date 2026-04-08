import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

import type { Category } from "../../services/api/categories.api";
import { useCreateCategory, useUpdateCategory } from "./use-categories";

type FormData = {
  name: string;
  description?: string;
};

type CategoryFormProps = {
  category?: Category | null;
  onCancelEdit?: () => void;
};

export function CategoryForm({ category, onCancelEdit }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditing = !!category;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  const errorMessage =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : isEditing
          ? "Error al editar la categoría."
          : "Error al crear la categoría.";

  useEffect(() => {
    reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
    });
  }, [category, reset]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(
        { id: category.id, data },
        { onSuccess: () => onCancelEdit?.() },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          reset();
          onCancelEdit?.();
        },
      });
    }
  };

  return (
    <div className="flex h-full flex-col text-sm transition-colors">
      {/* ── Header del form ─────────────────────────────────── */}
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
            {isEditing ? "Editando" : "Nueva categoría"}
          </p>
          <h2
            className="mt-0.5 text-base font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing ? category.name : "Crear categoría"}
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
        {/* Nombre */}
        <div className="space-y-1.5">
          <label
            htmlFor="cat-name"
            className="text-sm font-medium"
            style={{ color: "var(--foreground-soft)" }}
          >
            Nombre <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="cat-name"
            {...register("name", { required: "El nombre es obligatorio" })}
            placeholder="Ej: Empanadas clásicas"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
            style={{
              background: "var(--background)",
              borderColor: errors.name ? "var(--danger)" : "var(--border)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = isEditing
                ? "var(--warning)"
                : "var(--primary)";
              e.target.style.boxShadow = `0 0 0 3px ${isEditing ? "var(--warning-soft)" : "var(--ring)"}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name
                ? "var(--danger)"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
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
            htmlFor="cat-desc"
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
            id="cat-desc"
            {...register("description")}
            placeholder="Ej: Variedades tradicionales del menú"
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition"
            style={{
              background: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = isEditing
                ? "var(--warning)"
                : "var(--primary)";
              e.target.style.boxShadow = `0 0 0 3px ${isEditing ? "var(--warning-soft)" : "var(--ring)"}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
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
              ? "Categoría actualizada correctamente."
              : "Categoría creada correctamente."}
          </div>
        )}

        </div>

        {/* Footer */}
        <div
          className="shrink-0 border-t p-5"
          style={{
            borderColor: "var(--border-soft)",
            background: "var(--surface)",
          }}
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
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
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
                  : "Crear categoría"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
