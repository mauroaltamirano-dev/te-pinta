import { dashboardMapper }    from './dashboard.mapper';
import { dashboardRepository } from './dashboard.repository';
import type {
  DashboardRange,
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

function normalizeDate(dateIso: string): string {
  return new Date(dateIso).toISOString().slice(0, 10);
}

export const dashboardService = {
  async getSalesDashboard(input: {
    range: DashboardRange;
  }): Promise<SalesDashboardResponse> {
    const startDate = getRangeStart(input.range);

    // ── 1. Pedidos entregados en el rango ──────────────────────
    const allOrders = await dashboardRepository.findAllOrders();

    const deliveredOrders = allOrders.filter(
      (order) =>
        order.isActive &&
        order.status === 'delivered' &&
        new Date(order.createdAt) >= startDate,
    );

    // ── 2. Métricas de resumen ────────────────────────────────
    const grossSales   = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders  = deliveredOrders.length;
    const averageTicket = totalOrders > 0 ? grossSales / totalOrders : 0;

    // Items vendidos — necesita await por ser async
    let totalItemsSold = 0;
    for (const order of deliveredOrders) {
      const items = await dashboardRepository.findItemsByOrderId(order.id);
      totalItemsSold += items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // ── 3. Tendencia por día ──────────────────────────────────
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

    // ── 4. Ventas por canal ───────────────────────────────────
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

    // ── 5. Top productos ──────────────────────────────────────
    const topProductsMap = new Map<
      string,
      { productId: string; productName: string; quantitySold: number; totalSales: number }
    >();

    for (const order of deliveredOrders) {
      const items = await dashboardRepository.findItemsByOrderId(order.id);
      for (const item of items) {
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
    }

    const topProducts: TopProductItem[] = Array.from(topProductsMap.values())
      .sort((a, b) =>
        b.quantitySold !== a.quantitySold
          ? b.quantitySold - a.quantitySold
          : b.totalSales - a.totalSales,
      )
      .slice(0, 5);

    // ── 6. Ventas recientes ───────────────────────────────────
    const recentSalesRaw = deliveredOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const recentSales = await Promise.all(
      recentSalesRaw.map(async (order) => ({
        id:            order.id,
        customerName:  await dashboardRepository.findClientNameById(order.clientId),
        total:         order.totalAmount,
        paymentMethod: order.channel,
        createdAt:     order.createdAt,
        status:        order.status,
      })),
    );

    // ── 7. Respuesta ──────────────────────────────────────────
    return dashboardMapper.toSalesResponse({
      summary: { grossSales, totalOrders, averageTicket, totalItemsSold },
      trend,
      byPaymentMethod,
      topProducts,
      recentSales,
    });
  },
};