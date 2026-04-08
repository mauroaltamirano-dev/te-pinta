import { dashboardMapper }    from './dashboard.mapper';
import { dashboardRepository } from './dashboard.repository';
import type {
  DashboardRange,
  OperationalDashboardResponse,
  SalesByPaymentMethodItem,
  SalesDashboardResponse,
  SalesTrendItem,
  TopProductItem,
} from './dashboard.types';

function getRangeStart(range: DashboardRange): Date {
  const now   = new Date();
  const start = new Date(now);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === '7d') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === '30d') {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  // 'month'
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function normalizeDate(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export const dashboardService = {
  async getSalesDashboard(input: {
    range: DashboardRange;
  }): Promise<SalesDashboardResponse> {
    const startDate = getRangeStart(input.range);

    // ── 1. Pedidos + items en una sola pasada (fix N+1) ───────────────────────
    const allOrders = await dashboardRepository.findAllOrders();

    const deliveredOrders = allOrders.filter(
      (order) =>
        order.isActive &&
        order.status === 'delivered' &&
        new Date(order.createdAt) >= startDate,
    );

    // Traer todos los items de todos los pedidos en una sola query
    const deliveredIds   = deliveredOrders.map((o) => o.id);
    const allItems       = await dashboardRepository.findItemsByOrderIds(deliveredIds);

    // Índice de items por orderId para acceso O(1)
    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    // ── 2. Métricas de resumen ────────────────────────────────────────────────
    const grossSales    = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders   = deliveredOrders.length;
    const averageTicket = totalOrders > 0 ? grossSales / totalOrders : 0;
    const totalItemsSold = allItems.reduce((sum, item) => sum + item.quantity, 0);

    // ── 3. Tendencia por día ──────────────────────────────────────────────────
    const trendMap = new Map<string, { grossSales: number; orders: number }>();

    for (const order of deliveredOrders) {
      const date     = normalizeDate(order.createdAt);
      const existing = trendMap.get(date) ?? { grossSales: 0, orders: 0 };
      trendMap.set(date, {
        grossSales: existing.grossSales + order.totalAmount,
        orders:     existing.orders + 1,
      });
    }

    const trend: SalesTrendItem[] = Array.from(trendMap.entries())
      .map(([date, value]) => ({ date, grossSales: value.grossSales, orders: value.orders }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ── 4. Ventas por canal ───────────────────────────────────────────────────
    const channelMap = new Map<string, number>();
    for (const order of deliveredOrders) {
      channelMap.set(
        order.channel,
        (channelMap.get(order.channel) ?? 0) + order.totalAmount,
      );
    }

    const byPaymentMethod: SalesByPaymentMethodItem[] = Array.from(channelMap.entries())
      .map(([paymentMethod, total]) => ({ paymentMethod, total }))
      .sort((a, b) => b.total - a.total);

    // ── 5. Top productos ──────────────────────────────────────────────────────
    const topProductsMap = new Map<
      string,
      { productId: string; productName: string; quantitySold: number; totalSales: number }
    >();

    for (const item of allItems) {
      const existing = topProductsMap.get(item.productId) ?? {
        productId:    item.productId,
        productName:  item.productNameSnapshot,
        quantitySold: 0,
        totalSales:   0,
      };
      topProductsMap.set(item.productId, {
        productId:    item.productId,
        productName:  item.productNameSnapshot,
        quantitySold: existing.quantitySold + item.quantity,
        totalSales:   existing.totalSales + item.lineSubtotal,
      });
    }

    const topProducts: TopProductItem[] = Array.from(topProductsMap.values())
      .sort((a, b) =>
        b.quantitySold !== a.quantitySold
          ? b.quantitySold - a.quantitySold
          : b.totalSales - a.totalSales,
      )
      .slice(0, 5);

    // ── 6. Ventas recientes ───────────────────────────────────────────────────
    const recentSalesRaw = deliveredOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Resolver nombres de clientes en paralelo (sin N+1 secuencial)
    const recentSales = await Promise.all(
      recentSalesRaw.map(async (order) => ({
        id:            order.id,
        customerName:  await dashboardRepository.findClientNameById(order.clientId),
        total:         order.totalAmount,
        paymentMethod: order.channel,
        createdAt:     order.createdAt instanceof Date
                         ? order.createdAt.toISOString()
                         : String(order.createdAt),
        status:        order.status,
      })),
    );

    // ── 7. Respuesta ──────────────────────────────────────────────────────────
    return dashboardMapper.toSalesResponse({
      summary: { grossSales, totalOrders, averageTicket, totalItemsSold },
      trend,
      byPaymentMethod,
      topProducts,
      recentSales,
    });
  },

  // ── Dashboard operativo actual ──────────────────────────────────────────────
  // Devuelve el estado en tiempo real de pedidos confirmed + prepared.
  // No filtra por fecha — muestra TODO lo que está activo hoy.
  async getOperationalDashboard(): Promise<OperationalDashboardResponse> {
    const allOrders = await dashboardRepository.findAllOrders();

    const activeOrders = allOrders.filter(
      (o) => o.isActive && (o.status === 'confirmed' || o.status === 'prepared'),
    );

    const confirmedCount = activeOrders.filter((o) => o.status === 'confirmed').length;
    const preparedCount  = activeOrders.filter((o) => o.status === 'prepared').length;

    // Items de todos los pedidos activos en una sola query
    const activeIds  = activeOrders.map((o) => o.id);
    const allItems   = await dashboardRepository.findItemsByOrderIds(activeIds);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    // Acumular unidades y variedades (SOLO de pedidos confirmados)
    let totalUnits = 0;
    const varietyMap = new Map<
      string,
      { productId: string; productName: string; units: number }
    >();

    for (const item of allItems) {
      const order = activeOrders.find(o => o.id === item.orderId);
      if (order?.status !== 'confirmed') continue;

      totalUnits += item.quantity;
      const existing = varietyMap.get(item.productId) ?? {
        productId:   item.productId,
        productName: item.productNameSnapshot,
        units:       0,
      };
      varietyMap.set(item.productId, {
        ...existing,
        units: existing.units + item.quantity,
      });
    }

    const varieties = Array.from(varietyMap.values())
      .map((v) => ({ ...v, dozens: v.units / 12 }))
      .sort((a, b) => b.units - a.units);

    // Resolver nombres en paralelo
    const activeOrdersSummary = await Promise.all(
      activeOrders.map(async (order) => {
        const items = itemsByOrder.get(order.id) ?? [];
        const orderUnits = items.reduce((sum, i) => sum + i.quantity, 0);
        return {
          id:           order.id,
          customerName: await dashboardRepository.findClientNameById(order.clientId),
          status:       order.status as 'confirmed' | 'prepared',
          channel:      order.channel,
          deliveryDate: order.deliveryDate
            ? (order.deliveryDate instanceof Date
                ? order.deliveryDate.toISOString()
                : String(order.deliveryDate))
            : null,
          totalAmount:  order.totalAmount,
          totalUnits:   orderUnits,
        };
      }),
    );

    return {
      confirmedCount,
      preparedCount,
      totalActiveOrders: activeOrders.length,
      totalUnits,
      totalDozens: totalUnits / 12,
      varieties,
      activeOrders: activeOrdersSummary,
    };
  },
};