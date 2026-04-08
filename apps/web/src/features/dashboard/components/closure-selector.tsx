import type { WeeklyClosure } from "../../../services/api/weekly-closures.api";

type Props = {
  closures: WeeklyClosure[];
  selectedId: string | null;
  onChange: (id: string) => void;
};

function formatClosureLabel(closure: WeeklyClosure): string {
  const start = new Date(closure.startDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
  const end = new Date(closure.endDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
  return closure.name ?? `${start} – ${end}`;
}

export function ClosureSelector({ closures, selectedId, onChange }: Props) {
  if (closures.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: "var(--foreground-muted)" }}
      >
        Semana:
      </span>
      <div className="relative">
        <select
          value={selectedId ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none text-sm rounded-lg pl-3 pr-8 py-1.5 border focus:outline-none"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border-strong)",
            color: "var(--foreground)",
            boxShadow: "var(--shadow-sm)",
            cursor: "pointer",
          }}
        >
          {closures.map((c) => (
            <option key={c.id} value={c.id}>
              {formatClosureLabel(c)}
              {c.status === "open" ? " · abierta" : ""}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
