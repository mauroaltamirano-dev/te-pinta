import { useOrdersSummary } from "../orders/use-orders";
import { usePurchasesSummary } from "../purchases/use-purchases";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

type SummaryCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
};

function SummaryCard({ label, value, highlight, negative }: SummaryCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm",
        highlight && !negative
          ? "border-bordo/30 bg-bordo text-crema"
          : negative
            ? "border-red-200 bg-red-50"
            : "border-sombra bg-crema",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-semibold uppercase tracking-wide",
          highlight && !negative
            ? "text-crema/70"
            : negative
              ? "text-red-600"
              : "text-cafe/60",
        ].join(" ")}
      >
        {label}
      </p>
      <p
        className={[
          "mt-2 text-2xl font-bold",
          highlight && !negative
            ? "text-crema"
            : negative
              ? "text-red-600"
              : "text-bordo",
        ].join(" ")}
      >
        {value}
      </p>
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
      <p className="text-sm text-cafe/70">Cargando resumen de ingresos...</p>
    );
  }

  const totalRevenue = ordersSummary?.totalRevenue ?? 0;
  const deliveredCount = ordersSummary?.deliveredCount ?? 0;
  const averageTicket = ordersSummary?.averageTicket ?? 0;
  const totalExpenses = purchasesSummary?.totalAmount ?? 0;
  const estimatedResult = totalRevenue - totalExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Total ingresos" value={formatMoney(totalRevenue)} highlight />
      <SummaryCard label="Pedidos entregados" value={String(deliveredCount)} />
      <SummaryCard label="Ticket promedio" value={formatMoney(averageTicket)} />
      <SummaryCard label="Total egresos" value={formatMoney(totalExpenses)} />
      <SummaryCard
        label="Resultado estimado"
        value={formatMoney(estimatedResult)}
        highlight={estimatedResult >= 0}
        negative={estimatedResult < 0}
      />
    </div>
  );
}
