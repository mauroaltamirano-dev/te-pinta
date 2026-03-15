import { PageHeader } from "../../components/shared/PageHeader";

export function SettingsPage() {
  return (
    <section>
      <PageHeader
        title="Configuración"
        description="Parámetros generales del sistema."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-300">
          Módulo de configuración en construcción.
        </p>
      </div>
    </section>
  );
}
