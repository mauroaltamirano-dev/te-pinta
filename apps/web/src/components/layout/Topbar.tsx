import { Menu, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type TopbarProps = {
  title: string;
  onOpenMobileSidebar: () => void;
};

export function Topbar({ title, onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 h-14 shrink-0 border-b border-border-soft bg-background-soft/80 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        {/* Izquierda: hamburguesa (mobile) + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            <Menu size={17} />
          </button>

          {/* Breadcrumb contextual */}
          <nav className="flex items-center gap-1.5 min-w-0" aria-label="Ubicación">
            <span className="text-xs font-medium text-foreground-faint hidden sm:inline">
              Te Pinta
            </span>
            <ChevronRight size={12} className="text-foreground-faint shrink-0 hidden sm:inline" />
            <h1 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h1>
          </nav>
        </div>

        {/* Derecha: theme toggle + usuario */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition hover:bg-surface-2"
            role="button"
            tabIndex={0}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-primary"
              style={{ background: "rgba(192, 122, 82, 0.12)" }}
            >
              A
            </div>
            <span className="text-xs font-medium text-foreground-soft hidden sm:inline">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
