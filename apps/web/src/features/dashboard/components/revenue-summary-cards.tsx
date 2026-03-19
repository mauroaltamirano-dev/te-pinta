import { useOrdersSummary } from "../../orders/use-orders";
import { usePurchasesSummary } from "../../purchases/use-purchases";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

type CardProps = {
  label: string;
  value: string;
  accent?: "primary" | "success" | "danger" | "neutral";
  subtext?: string;
};

function SummaryCard({ label, value, accent = "neutral", subtext }: CardProps) {
  const accentColor =
    accent === "primary"
      ? "var(--primary)"
      : accent === "success"
        ? "var(--success-text)"
        : accent === "danger"
          ? "var(--danger-text)"
          : "var(--foreground)";

  const borderColor =
    accent === "primary"
      ? "var(--primary)"
      : accent === "success"
        ? "var(--success)"
        : accent === "danger"
          ? "var(--danger)"
          : "var(--border)";

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "var(--surface)",
        borderColor: borderColor,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-2xl font-bold tabular-nums"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      {subtext && (
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

export function RevenueSummaryCards() {
  const { data: ordersSummary, isLoading: isOrdersLoading } =
    useOrdersSummary();
  const { data: purchasesSummary, isLoading: isPurchasesLoading } =
    usePurchasesSummary();

  const isLoading = isOrdersLoading || isPurchasesLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          />
        ))}
      </div>
    );
  }

  const totalRevenue = ordersSummary?.totalRevenue ?? 0;
  const deliveredCount = ordersSummary?.deliveredCount ?? 0;
  const averageTicket = ordersSummary?.averageTicket ?? 0;
  const totalExpenses = purchasesSummary?.totalAmount ?? 0;
  const estimatedResult = totalRevenue - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Ingresos totales"
        value={formatMoney(totalRevenue)}
        accent="primary"
      />
      <SummaryCard label="Pedidos entregados" value={String(deliveredCount)} />
      <SummaryCard label="Ticket promedio" value={formatMoney(averageTicket)} />
      <SummaryCard label="Egresos totales" value={formatMoney(totalExpenses)} />
      <SummaryCard
        label="Resultado estimado"
        value={formatMoney(estimatedResult)}
        accent={estimatedResult >= 0 ? "success" : "danger"}
        subtext={
          estimatedResult >= 0 ? "Resultado positivo" : "Revisar egresos"
        }
      />
    </div>
  );
}
