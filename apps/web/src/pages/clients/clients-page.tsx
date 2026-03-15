export function ClientsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Clientes
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Clientes</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Administración de clientes del sistema: alta, seguimiento y
          asociación con pedidos. Este módulo está en desarrollo.
        </p>
      </section>

      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Módulo de clientes en construcción.</p>
      </div>
    </div>
  );
}
