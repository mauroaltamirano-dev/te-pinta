export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sombra bg-crema/95 px-6 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-cafe/70">Panel interno</p>
        <p className="text-base font-semibold text-bordo">
          Gestión operativa y contable
        </p>
      </div>

      <div className="rounded-full border border-sombra bg-arena px-4 py-2 text-sm font-medium text-cafe">
        Admin
      </div>
    </header>
  );
}
