import { dashboardMapper } from './dashboard.mapper';
import { dashboardRepository } from './dashboard.repository';
import type {
  DashboardRange,
  SalesByPaymentMethodItem,
  SalesDashboardResponse,
  SalesTrendItem,
  TopProductItem,
} from './dashboard.types';

function getRangeStart(range: DashboardRange) {
  const now = new Date();
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

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function normalizeDate(dateIso: string) {
  return new Date(dateIso).toISOString().slice(0, 10);
}

export const dashboardService = {
  getSalesDashboard(input: { range: DashboardRange }): SalesDashboardResponse {
    const startDate = getRangeStart(input.range);

    const deliveredOrders = dashboardRepository
      .findAllOrders()
      .filter(
        (order) =>
          order.isActive &&
          order.status === 'delivered' &&
          new Date(order.createdAt) >= startDate,
      );

    const grossSales = deliveredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    const totalOrders = deliveredOrders.length;
    const averageTicket = totalOrders > 0 ? grossSales / totalOrders : 0;

    const totalItemsSold = deliveredOrders.reduce((sum, order) => {
      const items = dashboardRepository.findItemsByOrderId(order.id);
      return (
        sum +
        items.reduce((itemsSum, item) => itemsSum + item.quantity, 0)
      );
    }, 0);

    const trendMap = new Map<string, { grossSales: number; orders: number }>();

    for (const order of deliveredOrders) {
      const date = normalizeDate(order.createdAt);
      const existing = trendMap.get(date) ?? { grossSales: 0, orders: 0 };

      trendMap.set(date, {
        grossSales: existing.grossSales + order.totalAmount,
        orders: existing.orders + 1,
      });
    }

    const trend: SalesTrendItem[] = Array.from(trendMap.entries())
      .map(([date, value]) => ({
        date,
        grossSales: value.grossSales,
        orders: value.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const paymentMethodMap = new Map<string, number>();

    for (const order of deliveredOrders) {
      const paymentMethod = order.channel;

      paymentMethodMap.set(
        paymentMethod,
        (paymentMethodMap.get(paymentMethod) ?? 0) + order.totalAmount,
      );
    }

    const byPaymentMethod: SalesByPaymentMethodItem[] = Array.from(
      paymentMethodMap.entries(),
    )
      .map(([paymentMethod, total]) => ({
        paymentMethod,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    const topProductsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        totalSales: number;
      }
    >();

    for (const order of deliveredOrders) {
      const items = dashboardRepository.findItemsByOrderId(order.id);

      for (const item of items) {
        const existing = topProductsMap.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productNameSnapshot,
          quantitySold: 0,
          totalSales: 0,
        };

        topProductsMap.set(item.productId, {
          productId: item.productId,
          productName: item.productNameSnapshot,
          quantitySold: existing.quantitySold + item.quantity,
          totalSales: existing.totalSales + item.lineSubtotal,
        });
      }
    }

    const topProducts: TopProductItem[] = Array.from(topProductsMap.values())
      .sort((a, b) => {
        if (b.quantitySold !== a.quantitySold) {
          return b.quantitySold - a.quantitySold;
        }

        return b.totalSales - a.totalSales;
      })
      .slice(0, 5);

    const recentSales = deliveredOrders
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        id: order.id,
        customerName: dashboardRepository.findClientNameById(order.clientId),
        total: order.totalAmount,
        paymentMethod: order.channel,
        createdAt: order.createdAt,
        status: order.status,
      }));

    return dashboardMapper.toSalesResponse({
      summary: {
        grossSales,
        totalOrders,
        averageTicket,
        totalItemsSold,
      },
      trend,
      byPaymentMethod,
      topProducts,
      recentSales,
    });
  },
};