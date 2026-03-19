import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type TopbarProps = {
  title: string;
  onOpenMobileSidebar: () => void;
};

export function Topbar({ title, onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 h-16 shrink-0 border-b border-border-soft bg-background-soft/80 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        {/* Izquierda: hamburguesa (mobile) + título */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            <Menu size={17} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
              Panel interno
            </p>
            <h1 className="truncate text-sm font-semibold text-foreground md:text-[15px]">
              {title}
            </h1>
          </div>
        </div>
        {/* Derecha: theme toggle + usuario */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-1.5 shadow-app-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-[11px] font-semibold text-primary">
              A
            </div>
            <span className="text-xs font-medium text-foreground-soft">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
