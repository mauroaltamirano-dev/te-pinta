type KpiCardProps = {
  title: string;
  value: string;
  helper?: string;
  /** Ícono emoji o cualquier ReactNode para decoración */
  icon?: React.ReactNode;
  /** Variante semántica para el acento de color */
  accent?: "default" | "success" | "warning" | "danger" | "info";
};

const ACCENT_STYLES: Record<
  NonNullable<KpiCardProps["accent"]>,
  { dot: string; value: string }
> = {
  default: {
    dot: "var(--primary)",
    value: "var(--foreground)",
  },
  success: {
    dot: "var(--success)",
    value: "var(--success-text)",
  },
  warning: {
    dot: "var(--warning)",
    value: "var(--warning-text)",
  },
  danger: {
    dot: "var(--danger)",
    value: "var(--danger-text)",
  },
  info: {
    dot: "var(--info)",
    value: "var(--info-text)",
  },
};

export function KpiCard({
  title,
  value,
  helper,
  icon,
  accent = "default",
}: KpiCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className="rounded-2xl border p-5 transition"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--foreground-muted)" }}
        >
          {title}
        </p>
        {icon && (
          <span className="text-base leading-none opacity-60">{icon}</span>
        )}
      </div>

      {/* Valor principal */}
      <p
        className="mt-3 text-2xl font-bold tabular-nums leading-none"
        style={{ color: styles.value }}
      >
        {value}
      </p>

      {/* Helper / subtexto */}
      {helper && (
        <p
          className="mt-1.5 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          {helper}
        </p>
      )}

      {/* Barra de acento inferior */}
      <div
        className="mt-4 h-0.5 w-8 rounded-full"
        style={{ background: styles.dot }}
      />
    </div>
  );
}
