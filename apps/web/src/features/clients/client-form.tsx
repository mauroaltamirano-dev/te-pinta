import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose } from "react-icons/md";

import type { Client } from "../../services/api/clients.api";
import { useCreateClient, useUpdateClient } from "./use-clients";

type FormData = {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
};

type Props = {
  client?: Client | null;
  onClose?: () => void;
};

export function ClientForm({ client, onClose }: Props) {
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      address: client?.address ?? "",
      notes: client?.notes ?? "",
    },
  });

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const error = createMutation.error || updateMutation.error;

  useEffect(() => {
    reset({
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      address: client?.address ?? "",
      notes: client?.notes ?? "",
    });
  }, [client, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };

    if (isEditing && client) {
      updateMutation.mutate(
        { id: client.id, data: payload },
        { onSuccess: () => onClose?.() },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose?.();
        },
      });
    }
  };

  /* ── estilos ────────────────────────────────────────────── */
  const fieldBase =
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition";
  const fieldStyle = (hasError?: boolean) => ({
    background: "var(--background)",
    borderColor: hasError ? "var(--danger)" : "var(--border)",
    color: "var(--foreground)",
  });
  const focusOn = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.target.style.borderColor = isEditing
      ? "var(--warning)"
      : "var(--primary)";
    e.target.style.boxShadow = `0 0 0 3px ${isEditing ? "var(--warning-soft)" : "var(--ring)"}`;
  };
  const focusOff = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    hasError?: boolean,
  ) => {
    e.target.style.borderColor = hasError ? "var(--danger)" : "var(--border)";
    e.target.style.boxShadow = "none";
  };

  const labelStyle = { color: "var(--foreground-soft)" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between border-b px-6 py-5 shrink-0"
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
            {isEditing ? "Editando cliente" : "Nuevo cliente"}
          </p>
          <h2
            className="mt-0.5 text-base font-bold"
            style={{
              color: isEditing ? "var(--warning-text)" : "var(--foreground)",
            }}
          >
            {isEditing ? client.name : "Registrar cliente"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 transition"
          style={{
            color: isEditing
              ? "var(--warning-text)"
              : "var(--foreground-muted)",
          }}
        >
          <MdClose size={20} />
        </button>
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 px-6 py-5">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            Nombre o apodo <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            {...register("name", { required: "El nombre es obligatorio" })}
            placeholder="Ej: María García o Maru"
            className={fieldBase}
            style={fieldStyle(!!errors.name)}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e, !!errors.name)}
          />
          {errors.name && (
            <p className="text-xs" style={{ color: "var(--danger-text)" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            Teléfono{" "}
            <span
              className="text-xs font-normal"
              style={{ color: "var(--foreground-muted)" }}
            >
              (opcional)
            </span>
          </label>
          <input
            {...register("phone")}
            placeholder="Ej: 351 123 4567"
            className={fieldBase}
            style={fieldStyle()}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e)}
          />
        </div>

        {/* Dirección */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            Dirección{" "}
            <span
              className="text-xs font-normal"
              style={{ color: "var(--foreground-muted)" }}
            >
              (opcional)
            </span>
          </label>
          <input
            {...register("address")}
            placeholder="Ej: Av. Colón 1234, Córdoba"
            className={fieldBase}
            style={fieldStyle()}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e)}
          />
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={labelStyle}>
            Notas internas{" "}
            <span
              className="text-xs font-normal"
              style={{ color: "var(--foreground-muted)" }}
            >
              (opcional)
            </span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Preferencias, restricciones, comentarios..."
            className={`${fieldBase} resize-none`}
            style={fieldStyle()}
            onFocus={focusOn}
            onBlur={(e) => focusOff(e)}
          />
        </div>

        {/* Error */}
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
              : "Error al guardar el cliente."}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div
        className="flex gap-2 border-t px-6 py-4 shrink-0"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition"
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
          className="flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: isEditing ? "var(--warning)" : "var(--primary)",
            color: isEditing ? "#fff" : "var(--primary-foreground)",
          }}
        >
          {isPending
            ? isEditing
              ? "Guardando…"
              : "Registrando…"
            : isEditing
              ? "Guardar cambios"
              : "Registrar cliente"}
        </button>
      </div>
    </form>
  );
}
