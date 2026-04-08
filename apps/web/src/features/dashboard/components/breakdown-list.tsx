type BreakdownItem = {
  label: string;
  value: number;
  isCount?: boolean;
};

type Props = {
  title: string;
  items: BreakdownItem[];
  emptyText?: string;
};

function formatValue(value: number, isCount: boolean): string {
  if (isCount) return value.toLocaleString("es-AR");
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  local: "Local",
  phone: "Teléfono",
  other: "Otro",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  prepared: "Preparado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const PURCHASE_TYPE_LABELS: Record<string, string> = {
  ingredient: "Ingredientes",
  operational: "Operacional",
  investment: "Inversión",
};

export function humanizeLabel(raw: string): string {
  return (
    CHANNEL_LABELS[raw] ??
    STATUS_LABELS[raw] ??
    PURCHASE_TYPE_LABELS[raw] ??
    raw.charAt(0).toUpperCase() + raw.slice(1)
  );
}

export function BreakdownList({ title, items, emptyText = "Sin datos" }: Props) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--foreground-muted)" }}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <li key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm"
                    style={{ color: "var(--foreground-soft)" }}
                  >
                    {humanizeLabel(item.label)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      {formatValue(item.value, item.isCount ?? false)}
                    </span>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--surface-3)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: "var(--primary)",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
