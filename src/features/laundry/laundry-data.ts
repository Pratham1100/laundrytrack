export const LAUNDRY_STATUSES = ["Received", "In Process", "Ready", "Delivered"] as const;

export type LaundryStatus = (typeof LAUNDRY_STATUSES)[number];
export type LaundryStatusFilter = LaundryStatus | "All statuses";

export interface LaundryOrder {
  barcodeId: string;
  customerName: string;
  items: number;
  date: string;
  status: LaundryStatus;
}

export const SAMPLE_ORDERS: LaundryOrder[] = [
  { barcodeId: "LT-28491", customerName: "Ava Mitchell", items: 3, date: "Nov 20, 2026", status: "Received" },
  { barcodeId: "LT-28490", customerName: "Jordan Lee", items: 5, date: "Nov 20, 2026", status: "In Process" },
  { barcodeId: "LT-28489", customerName: "Sofia Patel", items: 2, date: "Nov 20, 2026", status: "Ready" },
  { barcodeId: "LT-28488", customerName: "Ethan Brooks", items: 4, date: "Nov 19, 2026", status: "Delivered" },
  { barcodeId: "LT-28487", customerName: "Olivia Chen", items: 6, date: "Nov 19, 2026", status: "In Process" },
  { barcodeId: "LT-28486", customerName: "Noah Williams", items: 2, date: "Nov 19, 2026", status: "Ready" },
  { barcodeId: "LT-28485", customerName: "Mia Thompson", items: 8, date: "Nov 18, 2026", status: "Delivered" },
  { barcodeId: "LT-28484", customerName: "Lucas Garcia", items: 3, date: "Nov 18, 2026", status: "Received" },
];

export function getNextLaundryStatus(status: LaundryStatus): LaundryStatus | null {
  const currentIndex = LAUNDRY_STATUSES.indexOf(status);
  return LAUNDRY_STATUSES[currentIndex + 1] ?? null;
}

export function filterLaundryOrders(
  orders: LaundryOrder[],
  query: string,
  status: LaundryStatusFilter,
): LaundryOrder[] {
  const normalizedQuery = query.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      order.customerName.toLowerCase().includes(normalizedQuery) ||
      order.barcodeId.toLowerCase().includes(normalizedQuery);
    const matchesStatus = status === "All statuses" || order.status === status;
    return matchesQuery && matchesStatus;
  });
}

export function getLaundryMetrics(orders: LaundryOrder[]) {
  return {
    total: orders.length,
    received: orders.filter((order) => order.status === "Received").length,
    inProcess: orders.filter((order) => order.status === "In Process").length,
    ready: orders.filter((order) => order.status === "Ready").length,
    delivered: orders.filter((order) => order.status === "Delivered").length,
  };
}