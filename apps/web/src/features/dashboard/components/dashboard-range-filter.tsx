import type { DashboardRange } from "../../../services/api/dashboard.api";

type Props = {
  value: DashboardRange;
  onChange: (value: DashboardRange) => void;
};

const options: { label: string; value: DashboardRange }[] = [
  { label: "Hoy", value: "today" },
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "Mes actual", value: "month" },
];

export function DashboardRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "rounded-2xl border px-4 py-2 text-sm font-medium transition",
              active
                ? "border-bordo bg-bordo text-crema"
                : "border-sombra bg-crema text-cafe hover:bg-arena",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
