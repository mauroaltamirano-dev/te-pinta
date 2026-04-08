import { Wallet, Carrot, Wrench, TrendingUp, Hash } from "lucide-react";
import { usePurchasesSummary } from "./use-purchases";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

type Accent = "primary" | "info" | "warning" | "success" | "neutral";

const ACCENT_STYLES: Record<
  Accent,
  { border: string; iconBg: string; iconColor: string }
> = {
  primary: {
    border: "var(--primary)",
    iconBg: "rgba(192, 122, 82, 0.12)",
    iconColor: "var(--primary)",
  },
  info: {
    border: "var(--info)",
    iconBg: "var(--info-soft)",
    iconColor: "var(--info-text)",
  },
  warning: {
    border: "var(--warning)",
    iconBg: "var(--warning-soft)",
    iconColor: "var(--warning-text)",
  },
  success: {
    border: "var(--success)",
    iconBg: "var(--success-soft)",
    iconColor: "var(--success-text)",
  },
  neutral: {
    border: "var(--border-strong)",
    iconBg: "var(--surface-3)",
    iconColor: "var(--foreground-muted)",
  },
};

type SummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
  accent?: Accent;
  icon: React.ReactNode;
};

function SummaryCard({
  label,
  value,
  helper,
  accent = "neutral",
  icon,
}: SummaryCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        borderLeft: `3px solid ${styles.border}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--foreground-muted)" }}
          >
            {label}
          </p>
          <p
            className="mt-1.5 text-2xl font-bold tabular-nums leading-none tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            {value}
          </p>
          {helper ? (
            <p
              className="mt-1.5 text-[11px]"
              style={{ color: "var(--foreground-faint)" }}
            >
              {helper}
            </p>
          ) : null}
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: styles.iconBg, color: styles.iconColor }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export function PurchasesSummaryCards() {
  const { data, isLoading } = usePurchasesSummary();

  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              borderLeft: "3px solid var(--border-strong)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div
                  className="h-3 w-20 rounded"
                  style={{ background: "var(--surface-3)" }}
                />
                <div
                  className="h-7 w-28 rounded"
                  style={{ background: "var(--surface-3)" }}
                />
                <div
                  className="h-3 w-24 rounded"
                  style={{ background: "var(--surface-3)" }}
                />
              </div>
              <div
                className="h-8 w-8 rounded-lg"
                style={{ background: "var(--surface-3)" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Total egresos"
        value={formatMoney(data?.totalAmount ?? 0)}
        helper="Suma de todos los registros"
        accent="primary"
        icon={<Wallet size={16} />}
      />
      <SummaryCard
        label="Ingredientes"
        value={formatMoney(data?.ingredientTotal ?? 0)}
        helper="Compras de insumos"
        accent="info"
        icon={<Carrot size={16} />}
      />
      <SummaryCard
        label="Operativos"
        value={formatMoney(data?.operationalTotal ?? 0)}
        helper="Gastos del negocio"
        accent="warning"
        icon={<Wrench size={16} />}
      />
      <SummaryCard
        label="Inversiones"
        value={formatMoney(data?.investmentTotal ?? 0)}
        helper="Equipamiento y capital"
        accent="success"
        icon={<TrendingUp size={16} />}
      />
      <SummaryCard
        label="Registros"
        value={String(data?.count ?? 0)}
        helper="Movimientos totales"
        accent="neutral"
        icon={<Hash size={16} />}
      />
    </div>
  );
}
