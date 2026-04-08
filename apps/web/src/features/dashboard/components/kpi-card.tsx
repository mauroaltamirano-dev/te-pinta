type KpiCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
  accent?: "default" | "success" | "warning" | "danger" | "info";
};

const ACCENT_STYLES: Record<
  NonNullable<KpiCardProps["accent"]>,
  { border: string; value: string; iconBg: string }
> = {
  default: {
    border: "var(--primary)",
    value: "var(--foreground)",
    iconBg: "rgba(192, 122, 82, 0.12)",
  },
  success: {
    border: "var(--success)",
    value: "var(--success-text)",
    iconBg: "var(--success-soft)",
  },
  warning: {
    border: "var(--warning)",
    value: "var(--warning-text)",
    iconBg: "var(--warning-soft)",
  },
  danger: {
    border: "var(--danger)",
    value: "var(--danger-text)",
    iconBg: "var(--danger-soft)",
  },
  info: {
    border: "var(--info)",
    value: "var(--info-text)",
    iconBg: "var(--info-soft)",
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
      className="rounded-2xl p-5 transition"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${styles.border}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-xs font-semibold uppercase tracking-wider leading-snug"
          style={{ color: "var(--foreground-muted)" }}
        >
          {title}
        </p>
        {icon && (
          <span
            className="flex-shrink-0 text-sm leading-none rounded-lg p-1.5"
            style={{ background: styles.iconBg }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Valor principal */}
      <p
        className="mt-3 text-3xl font-bold tabular-nums leading-none"
        style={{ color: styles.value }}
      >
        {value}
      </p>

      {/* Helper */}
      {helper && (
        <p
          className="mt-2 text-xs leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}
