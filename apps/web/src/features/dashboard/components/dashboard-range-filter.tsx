import type { DashboardRange } from "../../../services/api/dashboard.api";

type Props = {
  value: DashboardRange;
  onChange: (value: DashboardRange) => void;
};

const OPTIONS: { label: string; value: DashboardRange }[] = [
  { label: "Hoy", value: "today" },
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "Este mes", value: "month" },
];

export function DashboardRangeFilter({ value, onChange }: Props) {
  return (
    <div
      className="flex gap-1 rounded-xl border p-1"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            style={
              active
                ? {
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }
                : {
                    background: "transparent",
                    color: "var(--foreground-muted)",
                  }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
