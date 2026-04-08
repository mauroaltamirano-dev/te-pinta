import { useState } from "react";
import { useCreateClosure } from "./use-weekly-closures";

export function WeeklyClosureForm({ onCancel }: { onCancel: () => void }) {
  const mutation = useCreateClosure();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { name, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString(), notes },
      { onSuccess: onCancel }
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}>
        <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Abrir nueva semana</h2>
        <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>Comienza un nuevo ciclo contable</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <form id="create-closure" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Nombre (Opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Semana 10 - Marzo"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
              style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Fecha Inicio</label>
                     <input
                         type="datetime-local"
                         value={startDate}
                         onChange={(e) => setStartDate(e.target.value)}
                         className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                         style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                     />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Fecha Fin</label>
                     <input
                         type="datetime-local"
                         value={endDate}
                         onChange={(e) => setEndDate(e.target.value)}
                         className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                         style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                     />
                 </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Notas / Observaciones</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Semana con feriado el viernes, compras de insumos para el mes..."
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition"
                  style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
             </div>
          </div>
        </form>
      </div>

      <div className="border-t px-6 py-4 flex gap-3 pr-safe pb-safe" style={{ borderColor: "var(--border-soft)", background: "var(--surface)" }}>
         <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border py-3 text-sm font-semibold transition"
            style={{ background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Cancelar
         </button>
         <button
            type="submit"
            form="create-closure"
            disabled={mutation.isPending || !startDate || !endDate}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Iniciar Semana
         </button>
      </div>
    </div>
  );
}
