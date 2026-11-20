import { describe, expect, it } from "vitest";

import {
  filterLaundryOrders,
  getNextLaundryStatus,
  getLaundryMetrics,
  SAMPLE_ORDERS,
} from "./laundry-data";

describe("laundry order rules", () => {
  it("advances orders through the stated status workflow", () => {
    expect(getNextLaundryStatus("Received")).toBe("In Process");
    expect(getNextLaundryStatus("In Process")).toBe("Ready");
    expect(getNextLaundryStatus("Ready")).toBe("Delivered");
    expect(getNextLaundryStatus("Delivered")).toBeNull();
  });

  it("searches customer names and barcode IDs without case sensitivity", () => {
    expect(filterLaundryOrders(SAMPLE_ORDERS, "ava mitchell", "All statuses")).toHaveLength(1);
    expect(filterLaundryOrders(SAMPLE_ORDERS, "lt-28491", "All statuses")).toHaveLength(1);
  });

  it("filters orders by the selected laundry status", () => {
    const readyOrders = filterLaundryOrders(SAMPLE_ORDERS, "", "Ready");
    expect(readyOrders).toHaveLength(2);
    expect(readyOrders.every((order) => order.status === "Ready")).toBe(true);
  });

  it("counts each sample order by its current status", () => {
    expect(getLaundryMetrics(SAMPLE_ORDERS)).toEqual({
      total: 8,
      received: 2,
      inProcess: 2,
      ready: 2,
      delivered: 2,
    });
  });
});