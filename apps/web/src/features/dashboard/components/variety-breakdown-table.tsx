type VarietyRow = {
  productName?: string;
  name?: string;
  units?: number;
  quantity?: number;
  dozens?: number;
};

type Props = {
  rows: VarietyRow[];
  showDozens?: boolean;
  emptyText?: string;
};

export function VarietyBreakdownTable({
  rows,
  showDozens = true,
  emptyText = "Sin variedades",
}: Props) {
  if (rows.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--foreground-muted)" }}
      >
        {emptyText}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-xs uppercase tracking-wider"
            style={{
              color: "var(--foreground-muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <th className="text-left pb-2 pr-4 font-medium">Variedad</th>
            <th className="text-right pb-2 px-4 font-medium">Unidades</th>
            {showDozens && (
              <th className="text-right pb-2 pl-4 font-medium">Docenas</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const name = row.productName ?? row.name ?? "—";
            const units = row.units ?? row.quantity ?? 0;
            const dozens = row.dozens ?? units / 12;
            return (
              <tr
                key={i}
                style={{ borderBottom: "1px solid var(--border)" }}
                className="last:border-0"
              >
                <td
                  className="py-2 pr-4 font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {name}
                </td>
                <td
                  className="py-2 px-4 text-right tabular-nums"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {units.toLocaleString("es-AR")}
                </td>
                {showDozens && (
                  <td
                    className="py-2 pl-4 text-right tabular-nums"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {dozens.toFixed(1)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
