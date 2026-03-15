import type { Purchase } from './purchases.types';

export const purchasesMapper = {
  toResponse(purchase: Purchase) {
    return purchase;
  },

  toResponseList(purchases: Purchase[]) {
    return purchases.map((purchase) => this.toResponse(purchase));
  },
};