import { weeklyClosuresRepository } from "./weekly-closures.repository";
import { ordersRepository } from "../orders/orders.repository";
import { purchasesRepository } from "../purchases/purchases.repository";
import type { WeeklyClosure, WeeklyClosureSnapshot, CreateWeeklyClosureInput } from "./weekly-closures.types";

export const weeklyClosuresService = {
  async getClosures() {
    return await weeklyClosuresRepository.findAll();
  },

  async getClosureById(id: string) {
    return await weeklyClosuresRepository.findById(id);
  },

  async getCurrentOpenClosure() {
    return await weeklyClosuresRepository.findOpenClosure();
  },

  async calculateSnapshot(startDate: Date, endDate: Date): Promise<WeeklyClosureSnapshot> {
    const allOrders = await ordersRepository.findAllOrders();
    const ordersInPeriod = allOrders.filter(o => 
      o.isActive && 
      new Date(o.createdAt) >= startDate && 
      new Date(o.createdAt) <= endDate
    );

    const allPurchases = await purchasesRepository.findAll();
    const purchasesInPeriod = allPurchases.filter((p: any) => 
       new Date(p.date) >= startDate && new Date(p.date) <= endDate
    );

    const deliveredOrders = ordersInPeriod.filter(o => o.status === "delivered");
    let grossRevenue = 0;
    let totalDiscounts = 0;
    let totalPurchases = 0;
    let totalIngredientPurchases = 0;
    let totalOperationalPurchases = 0;
    let totalInvestmentPurchases = 0;
    
    // Breakdowns
    const breakdownByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      prepared: 0,
      delivered: 0,
      cancelled: 0
    };
    const breakdownByChannel: Record<string, number> = {};

    for (const order of ordersInPeriod) {
      breakdownByStatus[order.status] = (breakdownByStatus[order.status] || 0) + 1;
      breakdownByChannel[order.channel] = (breakdownByChannel[order.channel] || 0) + 1;
      
      if (order.status === "delivered") {
        grossRevenue += order.totalAmount;
        totalDiscounts += (order.discountAmount || 0);
      }
    }

    const breakdownByPurchaseType: Record<string, number> = {};
    for (const p of purchasesInPeriod) {
      breakdownByPurchaseType[p.type] = (breakdownByPurchaseType[p.type] || 0) + p.totalAmount;
      totalPurchases += p.totalAmount;
      
      if (p.type === "ingredient") totalIngredientPurchases += p.totalAmount;
      else if (p.type === "operational") totalOperationalPurchases += p.totalAmount;
      else if (p.type === "investment") totalInvestmentPurchases += p.totalAmount;
    }

    let totalUnits = 0;
    const breakdownByVariety: Record<string, number> = {};
    
    for (const order of deliveredOrders) {
      const items = await ordersRepository.findItemsByOrderId(order.id);
      for (const item of items) {
        totalUnits += item.quantity;
        breakdownByVariety[item.productNameSnapshot] = (breakdownByVariety[item.productNameSnapshot] || 0) + item.quantity;
      }
    }

    const topVarieties = Object.entries(breakdownByVariety)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const averageTicket = deliveredOrders.length > 0 ? grossRevenue / deliveredOrders.length : 0;
    const estimatedProfit = grossRevenue - totalPurchases;

    return {
      totalOrders: ordersInPeriod.length,
      totalDeliveredOrders: deliveredOrders.length,
      confirmedOrders: breakdownByStatus.confirmed || 0,
      preparedOrders: breakdownByStatus.prepared || 0,
      cancelledOrders: breakdownByStatus.cancelled || 0,
      totalUnits,
      totalDozens: totalUnits / 12,
      grossRevenue,
      totalDiscounts,
      totalPurchases,
      totalIngredientPurchases,
      totalOperationalPurchases,
      totalInvestmentPurchases,
      estimatedProfit,
      averageTicket,
      topVarieties,
      breakdownByStatus,
      breakdownByPurchaseType,
      breakdownByChannel,
      breakdownByVariety
    };
  },

  async createClosure(data: CreateWeeklyClosureInput) {
    const existingOpen = await weeklyClosuresRepository.findOpenClosure();
    if (existingOpen) {
      throw new Error("Ya existe una caja semanal abierta. Cierra la actual primero.");
    }
    return await weeklyClosuresRepository.create(data);
  },

  async closeClosure(id: string) {
    const closure = await weeklyClosuresRepository.findById(id);
    if (!closure) throw new Error("Cierre no encontrado");
    if (closure.status === "closed") throw new Error("El cierre ya está finalizado");

    const snapshotData = await this.calculateSnapshot(new Date(closure.startDate), new Date(closure.endDate));
    return await weeklyClosuresRepository.close(id, JSON.stringify(snapshotData));
  },
  
  async getLiveMetrics(id: string) {
    const closure = await weeklyClosuresRepository.findById(id);
    if (!closure) throw new Error("Not found");
    if (closure.status === "closed" && closure.snapshot) {
      return JSON.parse(closure.snapshot) as WeeklyClosureSnapshot;
    }
    return await this.calculateSnapshot(new Date(closure.startDate), new Date(closure.endDate));
  },

  async deleteClosure(id: string) {
    return await weeklyClosuresRepository.delete(id);
  }
};
