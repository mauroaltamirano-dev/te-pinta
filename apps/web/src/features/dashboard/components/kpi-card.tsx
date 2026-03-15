type KpiCardProps = {
  title: string;
  value: string;
  helper?: string;
};

export function KpiCard({ title, value, helper }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-sombra bg-crema p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-bordo">{value}</p>
      {helper ? (
        <p className="mt-1 text-xs text-cafe/50">{helper}</p>
      ) : null}
    </div>
  );
}
