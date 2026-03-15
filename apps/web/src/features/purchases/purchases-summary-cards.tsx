import { usePurchasesSummary } from "./use-purchases";

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
  helper?: string;
  highlight?: boolean;
};

function SummaryCard({ label, value, helper, highlight }: SummaryCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm",
        highlight
          ? "border-bordo/30 bg-bordo text-crema"
          : "border-sombra bg-crema",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-semibold uppercase tracking-wide",
          highlight ? "text-crema/70" : "text-cafe/60",
        ].join(" ")}
      >
        {label}
      </p>
      <p
        className={[
          "mt-2 text-2xl font-bold",
          highlight ? "text-crema" : "text-bordo",
        ].join(" ")}
      >
        {value}
      </p>
      {helper ? (
        <p
          className={[
            "mt-1 text-xs",
            highlight ? "text-crema/60" : "text-cafe/50",
          ].join(" ")}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export function PurchasesSummaryCards() {
  const { data, isLoading } = usePurchasesSummary();

  if (isLoading) {
    return (
      <p className="text-sm text-cafe/70">Cargando resumen de egresos...</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Total egresos"
        value={formatMoney(data?.totalAmount ?? 0)}
        helper="Suma de todos los registros"
        highlight
      />
      <SummaryCard
        label="Ingredientes"
        value={formatMoney(data?.ingredientTotal ?? 0)}
        helper="Compras de insumos"
      />
      <SummaryCard
        label="Operativos"
        value={formatMoney(data?.operationalTotal ?? 0)}
        helper="Gastos del negocio"
      />
      <SummaryCard
        label="Inversiones"
        value={formatMoney(data?.investmentTotal ?? 0)}
        helper="Equipamiento y capital"
      />
      <SummaryCard
        label="Registros"
        value={String(data?.count ?? 0)}
        helper="Movimientos totales"
      />
    </div>
  );
}
