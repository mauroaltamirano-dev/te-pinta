import { useParams, useNavigate } from "react-router-dom";
import { useWeeklyClosure, useLiveMetrics } from "../../features/weekly-closures/use-weekly-closures";
import { 
  ArrowLeft, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Activity, 
  BarChart3, 
  PieChart,
  Calendar,
  AlertCircle
} from "lucide-react";
import { APP_ROUTES } from "../../constants/routes";

export function WeeklyReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: closure, isLoading: loadingClosure } = useWeeklyClosure(id);
  const { data: metrics, isLoading: loadingMetrics } = useLiveMetrics(id || null);

  const isLoading = loadingClosure || loadingMetrics;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-foreground-muted">Cargando reporte consolidado...</p>
    </div>
  );

  if (!closure || !metrics) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle size={48} className="text-danger" />
      <h2 className="text-xl font-bold">No se encontró el reporte</h2>
      <button 
        onClick={() => navigate(APP_ROUTES.weeklyClosures)}
        className="text-primary hover:underline underline-offset-4"
      >
        Volver al historial
      </button>
    </div>
  );

  const statusColors = {
    open: "bg-primary/10 text-primary border-primary/20",
    closed: "bg-success-soft text-success-text border-success-soft"
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8 animate-in fade-in duration-500">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <button 
          onClick={() => navigate(APP_ROUTES.weeklyClosures)}
          className="group flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Volver a Cierres Semanales
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b" style={{ borderColor: "var(--border-soft)" }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{closure.name || "Reporte Semanal"}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusColors[closure.status]}`}>
                {closure.status === "open" ? "Abierto" : "Cerrado"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-foreground-muted">
               <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span>{new Date(closure.startDate).toLocaleDateString()} — {new Date(closure.endDate).toLocaleDateString()}</span>
               </div>
               {closure.closedAt && (
                 <span className="italic">Cerrado el {new Date(closure.closedAt).toLocaleString()}</span>
               )}
            </div>
          </div>
          
          <div className="flex gap-4">
             {/* Indicators can go here */}
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl border shadow-sm space-y-1" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Ingresos Brutos</p>
           <div className="flex items-end gap-2 text-green-600">
              <DollarSign size={24} className="mb-1" />
              <span className="text-3xl font-black">${metrics.grossRevenue.toLocaleString()}</span>
           </div>
           <p className="text-xs text-foreground-faint">
             {metrics.totalDeliveredOrders} de {metrics.totalOrders} pedidos entregados
           </p>
        </div>

        <div className="p-6 rounded-3xl border shadow-sm space-y-1" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Egresos / Gastos</p>
           <div className="flex items-end gap-2 text-red-600">
              <TrendingDown size={24} className="mb-1" />
              <span className="text-3xl font-black">${metrics.totalPurchases.toLocaleString()}</span>
           </div>
           <p className="text-xs text-foreground-faint">
             Compras operativas e insumos
           </p>
        </div>

        <div className="p-6 rounded-3xl border shadow-sm space-y-1" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Resultado Neto Est.</p>
           <div className="flex items-end gap-2" style={{ color: "var(--primary)" }}>
              <Activity size={24} className="mb-1" />
              <span className="text-3xl font-black">${metrics.estimatedProfit.toLocaleString()}</span>
           </div>
           <p className="text-xs text-foreground-faint">
             Rentabilidad bruta estimada
           </p>
        </div>

        <div className="p-6 rounded-3xl border shadow-sm space-y-1" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
           <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Ticket Promedio</p>
           <div className="flex items-end gap-2 text-indigo-600">
              <BarChart3 size={24} className="mb-1" />
              <span className="text-3xl font-black">${metrics.averageTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
           </div>
           <p className="text-xs text-foreground-faint">
             Basado en ventas entregadas
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Column */}
        <div className="lg:col-span-2 space-y-8">
           <div className="p-8 rounded-3xl border space-y-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
                 <Package size={18} className="text-orange-500" />
                 <h2 className="text-sm uppercase tracking-widest font-black">Producción y Variedades</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-foreground-muted uppercase mb-1">Volumen Total</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black">{metrics.totalDozens.toFixed(1)}</span>
                        <span className="text-lg font-bold text-foreground-faint uppercase">Docenas</span>
                      </div>
                      <p className="text-[11px] text-foreground-faint font-medium mt-1">({metrics.totalUnits} unidades individuales)</p>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase text-foreground-muted pb-2 border-b" style={{ borderColor: "var(--border-soft)" }}>Top 10 Variedades Vendidas</h3>
                       <div className="space-y-3">
                          {metrics.topVarieties.map((v, i) => (
                            <div key={v.name} className="flex items-center gap-4">
                               <span className="text-xs font-black text-foreground-faint w-4">{i + 1}.</span>
                               <div className="flex-1 space-y-1">
                                  <div className="flex justify-between text-sm">
                                     <span className="font-bold">{v.name}</span>
                                     <span className="font-black">{(v.quantity / 12).toFixed(1)} <span className="text-[10px] font-normal uppercase">doc</span></span>
                                  </div>
                                  <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                                     <div 
                                      className="h-full bg-orange-500 rounded-full" 
                                      style={{ width: `${(v.quantity / metrics.topVarieties[0].quantity) * 100}%` }} 
                                     />
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-foreground-muted pb-2 border-b" style={{ borderColor: "var(--border-soft)" }}>Distribución por Estado</h3>
                    <div className="space-y-4">
                       {Object.entries(metrics.breakdownByStatus).map(([status, count]) => (
                         <div key={status} className="flex items-center justify-between p-3 rounded-2xl bg-surface-2 border" style={{ borderColor: "var(--border-soft)" }}>
                            <span className="text-sm font-bold capitalize text-foreground-soft">{status === 'delivered' ? 'Entregados' : status === 'confirmed' ? 'Confirmados' : status === 'prepared' ? 'Preparados' : status === 'cancelled' ? 'Cancelados' : status}</span>
                            <span className="text-lg font-black">{count}</span>
                         </div>
                       ))}
                    </div>

                    <h3 className="text-xs font-black uppercase text-foreground-muted pb-2 border-b mt-8" style={{ borderColor: "var(--border-soft)" }}>Ventas por Canal</h3>
                    <div className="space-y-3">
                       {Object.entries(metrics.breakdownByChannel || {}).map(([channel, count]) => (
                         <div key={channel} className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-foreground-soft capitalize">{channel}</span>
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-24 bg-surface-3 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${(count / metrics.totalOrders) * 100}%` }} 
                                  />
                               </div>
                               <span className="font-black">{count}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Expenses & Financial Detail Column */}
        <div className="space-y-8">
           <div className="p-8 rounded-3xl border space-y-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
                 <TrendingDown size={18} className="text-red-500" />
                 <h2 className="text-sm uppercase tracking-widest font-black">Análisis de Egresos</h2>
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <p className="text-[10px] font-black uppercase text-red-400 mb-1">Total Gastado</p>
                    <p className="text-3xl font-black text-red-600">${metrics.totalPurchases.toLocaleString()}</p>
                 </div>

                 <div className="space-y-3 pt-4">
                    <h3 className="text-xs font-black uppercase text-foreground-muted mb-2">Desglose por Categoría</h3>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold mb-1">
                             <span>Insumos / Ingredientes</span>
                             <span>${metrics.totalIngredientPurchases.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                             <div className="h-full bg-red-400" style={{ width: `${(metrics.totalIngredientPurchases / metrics.totalPurchases) * 100}%` }} />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold mb-1">
                             <span>Costos Operativos</span>
                             <span>${metrics.totalOperationalPurchases.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-400" style={{ width: `${(metrics.totalOperationalPurchases / metrics.totalPurchases) * 100}%` }} />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold mb-1">
                             <span>Inversiones</span>
                             <span>${metrics.totalInvestmentPurchases.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-400" style={{ width: `${(metrics.totalInvestmentPurchases / metrics.totalPurchases) * 100}%` }} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-3xl border space-y-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
                 <PieChart size={18} className="text-primary" />
                 <h2 className="text-sm uppercase tracking-widest font-black">KPI Comerciales</h2>
              </div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground-soft">Descuentos aplicados</span>
                    <span className="font-bold text-red-500">-${metrics.totalDiscounts.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-foreground-soft">Ingresos Netos</span>
                    <span className="font-bold">${(metrics.grossRevenue - metrics.totalDiscounts).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-t pt-4" style={{ borderColor: "var(--border-soft)" }}>
                    <span className="font-bold text-foreground">Margen Bruto Sist.</span>
                    <span className="text-xl font-black text-primary">
                       {metrics.grossRevenue > 0 ? ((metrics.estimatedProfit / metrics.grossRevenue) * 100).toFixed(1) : 0}%
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-6 rounded-3xl bg-surface-2 border border-dashed text-center" style={{ borderColor: "var(--border)" }}>
         <p className="text-xs text-foreground-faint font-medium">
            * Los cálculos de rentabilidad son estimados basados en el total de egresos registrados y el total de ventas entregadas en el período seleccionado.
         </p>
      </div>
    </div>
  );
}
