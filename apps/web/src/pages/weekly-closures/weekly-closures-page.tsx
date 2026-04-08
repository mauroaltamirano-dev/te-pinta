import { useState } from "react";
import { Drawer } from "../../components/ui/Drawer";
import { WeeklyClosureForm } from "../../features/weekly-closures/weekly-closure-form";
import { WeeklyClosureCard } from "../../features/weekly-closures/weekly-closure-card";
import {
  useWeeklyClosures,
  useCurrentOpenClosure,
  useDeleteClosure,
} from "../../features/weekly-closures/use-weekly-closures";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/routes";
import type { WeeklyClosure, WeeklyClosureSnapshot } from "../../services/api/weekly-closures.api";
import { Calendar, Trash2, ChevronRight, TrendingUp, TrendingDown, Info, Package } from "lucide-react";

export function WeeklyClosuresPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: closures, isLoading } = useWeeklyClosures();
  const { data: openClosure } = useCurrentOpenClosure();
  const deleteMutation = useDeleteClosure();

  const closedClosures = (closures?.filter((c: WeeklyClosure) => c.status === "closed") || []) as WeeklyClosure[];

  const handleDelete = (id: string, name: string | null) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de "${name || 'este cierre'}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            Caja Semanal
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--foreground-muted)" }}>
            Balance operativo y consolidación de ciclos de venta.
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          disabled={!!openClosure}
          className="rounded-2xl px-6 py-3 text-sm font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg inline-flex items-center gap-2"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <Calendar size={18} />
          {openClosure ? "Caja actualmente abierta" : "Abrir Nueva Semana"}
        </button>
      </div>

      {/* Active Closure Section */}
      {openClosure ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
             <h2 className="text-xs uppercase tracking-widest font-black text-primary">Estado de Semana Actual</h2>
          </div>
          <WeeklyClosureCard closure={openClosure} />
        </div>
      ) : (
        <div className="p-10 rounded-3xl border border-dashed flex flex-col items-center text-center space-y-4" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
           <div className="h-12 w-12 rounded-full bg-surface-3 flex items-center justify-center text-foreground-muted">
              <Info size={24} />
           </div>
           <div>
              <h3 className="text-lg font-bold">No hay ninguna semana abierta</h3>
              <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                 Iniciá un nuevo ciclo para comenzar a trackear tus ventas, compras y rentabilidad en tiempo real.
              </p>
           </div>
           <button 
              onClick={() => setDrawerOpen(true)}
              className="text-primary text-sm font-black hover:underline underline-offset-4"
           >
              Abrir ciclo ahora &rarr;
           </button>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <h2 className="text-xs uppercase tracking-widest font-black" style={{ color: "var(--foreground-muted)" }}>
             Historial de Ciclos Finalizados
           </h2>
           <div className="h-px flex-1 bg-border-soft" />
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse bg-surface-2" />)}
           </div>
        ) : closedClosures.length === 0 ? (
          <div className="text-center py-10">
             <p className="text-sm font-medium text-foreground-faint">Todavía no has cerrado ninguna semana operativa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closedClosures.map((closure) => {
              const snap = closure.snapshot ? (JSON.parse(closure.snapshot) as WeeklyClosureSnapshot) : null;
              
              return (
                <div
                  key={closure.id}
                  className="group relative p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="font-black text-xl leading-tight">
                         {closure.name || "Ciclo Operativo"}
                       </h3>
                       <div className="flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-tighter font-bold" style={{ color: "var(--foreground-muted)" }}>
                          <Calendar size={10} />
                          {new Date(closure.startDate).toLocaleDateString()} &mdash; {new Date(closure.endDate).toLocaleDateString()}
                       </div>
                    </div>
                    <button 
                       onClick={() => handleDelete(closure.id, closure.name)}
                       className="p-2 rounded-lg text-foreground-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                       title="Eliminar registro"
                    >
                       <Trash2 size={16} />
                    </button>
                  </div>

                  {snap ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2 text-foreground-muted">
                            <TrendingUp size={14} className="text-green-500" />
                            <span>Ventas</span>
                         </div>
                         <span className="font-bold">${snap.grossRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2 text-foreground-muted">
                            <TrendingDown size={14} className="text-red-500" />
                            <span>Gastos</span>
                         </div>
                         <span className="font-bold text-red-500">-${snap.totalPurchases.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2 text-foreground-muted">
                            <Package size={14} className="text-orange-500" />
                            <span>Empanadas</span>
                         </div>
                         <span className="font-bold">{snap.totalDozens.toFixed(1)} <span className="text-[10px] text-gray-400">DOC</span></span>
                      </div>
                      
                      <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border-soft)" }}>
                         <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black tracking-widest text-foreground-faint">Profit Estimado</span>
                            <span className="text-lg font-black" style={{ color: "var(--primary)" }}>${snap.estimatedProfit.toLocaleString()}</span>
                         </div>
                         <Link 
                            to={APP_ROUTES.weeklyReport.replace(":id", closure.id)}
                            className="h-10 px-4 rounded-xl bg-surface-2 flex items-center gap-2 text-xs font-bold text-foreground-muted hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                         >
                            Ver Reporte
                            <ChevronRight size={14} />
                         </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-3">
                       <p className="text-xs text-foreground-faint italic font-medium">Sin datos de snapshot disponibles.</p>
                       <Link 
                            to={APP_ROUTES.weeklyReport.replace(":id", closure.id)}
                            className="text-primary text-xs font-bold hover:underline"
                       >
                         Intentar ver reporte en vivo &rarr;
                       </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <WeeklyClosureForm onCancel={() => setDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}
