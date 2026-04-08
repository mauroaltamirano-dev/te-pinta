import type { WeeklyClosure } from "../../services/api/weekly-closures.api";
import { useLiveMetrics, useCloseClosure } from "./use-weekly-closures";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../constants/routes";
import { ShoppingBag, Truck, DollarSign, PieChart, Activity, CheckCircle2, Clock, BarChart2 } from "lucide-react";

export function WeeklyClosureCard({ closure }: { closure: WeeklyClosure }) {
  const { data: metrics, isLoading } = useLiveMetrics(closure.id);
  const closeMutation = useCloseClosure();

  if (isLoading || !metrics) return <div className="p-10 text-center animate-pulse">Calculando métricas en vivo...</div>;

  return (
    <div className="rounded-3xl border overflow-hidden transition-all shadow-sm hover:shadow-md" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ background: "var(--surface-2)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <h2 className="text-2xl font-black">{closure.name || "Semana en Curso"}</h2>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
             Desde {new Date(closure.startDate).toLocaleDateString()} hasta {new Date(closure.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={APP_ROUTES.weeklyReport.replace(":id", closure.id)}
            className="rounded-xl px-5 py-3 text-sm font-bold transition border hover:bg-surface-2 inline-flex items-center gap-2 shadow-sm"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <BarChart2 size={18} />
            Ver Reporte Detallado
          </Link>
          <button
            onClick={() => { if(confirm("¿Estás seguro de cerrar la semana registrando este snapshot histórico?")) closeMutation.mutate(closure.id) }}
            disabled={closeMutation.isPending}
            className="rounded-xl px-5 py-3 text-sm font-bold transition disabled:opacity-50 inline-flex items-center gap-2 shadow-md"
            style={{ background: "var(--danger)", color: "var(--danger-foreground)" }}
          >
            <CheckCircle2 size={18} />
            Finalizar y Cerrar Ciclo
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t divide-x divide-y sm:divide-y-0" style={{ borderColor: "var(--border)" }}>
         <div className="p-6">
            <div className="flex items-center gap-2 mb-2 text-green-600">
               <DollarSign size={16} />
               <p className="text-xs uppercase tracking-wider font-bold">Ventas Brutas</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "var(--foreground)" }}>${metrics.grossRevenue.toLocaleString("es-AR")}</p>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-faint)" }}>{metrics.totalDeliveredOrders} pedidos entregados</p>
         </div>
         <div className="p-6">
            <div className="flex items-center gap-2 mb-2 text-red-600">
               <Truck size={16} />
               <p className="text-xs uppercase tracking-wider font-bold">Compras (Egresos)</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "var(--foreground)" }}>${metrics.totalPurchases.toLocaleString("es-AR")}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] uppercase font-bold text-gray-400">
               <span>Ing: ${metrics.totalIngredientPurchases.toLocaleString()}</span>
               <span>Op: ${metrics.totalOperationalPurchases.toLocaleString()}</span>
            </div>
         </div>
         <div className="p-6">
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
               <Activity size={16} />
               <p className="text-xs uppercase tracking-wider font-bold">Resultado Est.</p>
            </div>
            <p className="text-3xl font-black" style={{ color: metrics.estimatedProfit >= 0 ? "var(--primary)" : "var(--danger)" }}>
               ${metrics.estimatedProfit.toLocaleString("es-AR")}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--foreground-muted)" }}>
               Profit estimado vs gastos
            </p>
         </div>
         <div className="p-6">
            <div className="flex items-center gap-2 mb-2 text-orange-600">
               <ShoppingBag size={16} />
               <p className="text-xs uppercase tracking-wider font-bold">Docenas</p>
            </div>
            <p className="text-3xl font-black" style={{ color: "var(--foreground)" }}>{metrics.totalDozens.toFixed(1)}</p>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-faint)" }}>{metrics.totalUnits} empanadas vendidas</p>
         </div>
      </div>

      <div className="p-6 border-t" style={{ borderColor: "var(--border)" }}>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
               <h3 className="text-xs uppercase tracking-widest font-black mb-4 flex items-center gap-2" style={{ color: "var(--foreground-muted)" }}>
                  <Clock size={14} /> Estados de Pedidos en el Período
               </h3>
               <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[100px] p-3 rounded-2xl border" style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}>
                     <p className="text-xs font-bold text-gray-400 uppercase">Confirmados</p>
                     <p className="text-xl font-black">{metrics.confirmedOrders}</p>
                  </div>
                  <div className="flex-1 min-w-[100px] p-3 rounded-2xl border" style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}>
                     <p className="text-xs font-bold text-gray-400 uppercase">Preparado</p>
                     <p className="text-xl font-black">{metrics.preparedOrders}</p>
                  </div>
                  <div className="flex-1 min-w-[100px] p-3 rounded-2xl border" style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}>
                     <p className="text-xs font-bold text-gray-400 uppercase">Cancelados</p>
                     <p className="text-xl font-black text-red-500">{metrics.cancelledOrders}</p>
                  </div>
               </div>
            </div>
            <div>
               <h3 className="text-xs uppercase tracking-widest font-black mb-4 flex items-center gap-2" style={{ color: "var(--foreground-muted)" }}>
                  <PieChart size={14} /> TOP Variedades (Docenas)
               </h3>
               <div className="space-y-2">
                  {metrics.topVarieties.length > 0 ? (
                    metrics.topVarieties.map((v, i) => (
                       <div key={v.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <span className="w-5 text-xs text-gray-400 font-bold">{i+1}.</span>
                             <span className="font-semibold text-gray-700">{v.name}</span>
                          </div>
                          <span className="font-black">{(v.quantity / 12).toFixed(1)} <span className="text-[10px] text-gray-400 uppercase">doc</span></span>
                       </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No hay datos de ventas disponibles para este rango.</p>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
