import { describe, expect, it } from "vitest";
import {
	computeCategoryData,
	computeKpiMetrics,
	computeSalesData,
	generateOrders,
} from "@/constants/dummyData";

describe("generateOrders", () => {
	it("지정한 수만큼 주문 데이터를 생성한다", () => {
		const orders = generateOrders(100);
		expect(orders).toHaveLength(100);
	});

	it("각 주문은 필수 필드를 가진다", () => {
		const [order] = generateOrders(1);
		expect(order).toHaveProperty("id");
		expect(order).toHaveProperty("orderNumber");
		expect(order).toHaveProperty("buyerName");
		expect(order).toHaveProperty("totalPrice");
		expect(order).toHaveProperty("status");
		expect(order).toHaveProperty("orderedAt");
	});

	it("주문번호는 ORD- 로 시작한다", () => {
		const orders = generateOrders(10);
		for (const order of orders) {
			expect(order.orderNumber).toMatch(/^ORD-/);
		}
	});

	it("totalPrice는 unitPrice * quantity 이다", () => {
		const orders = generateOrders(50);
		for (const order of orders) {
			expect(order.totalPrice).toBe(order.unitPrice * order.quantity);
		}
	});
});

describe("computeKpiMetrics", () => {
	it("KPI 메트릭 4개를 반환한다", () => {
		const orders = generateOrders(100);
		const metrics = computeKpiMetrics(orders);
		expect(metrics).toHaveLength(4);
	});

	it("KPI id 목록이 올바르다", () => {
		const orders = generateOrders(100);
		const ids = computeKpiMetrics(orders).map((m) => m.id);
		expect(ids).toContain("total_revenue");
		expect(ids).toContain("new_orders");
		expect(ids).toContain("delayed");
		expect(ids).toContain("return_rate");
	});
});

describe("computeSalesData", () => {
	it("daily 기간으로 데이터를 반환한다", () => {
		const orders = generateOrders(100);
		const data = computeSalesData(orders, "daily");
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty("label");
		expect(data[0]).toHaveProperty("revenue");
	});

	it("monthly 기간으로 데이터를 반환한다", () => {
		const orders = generateOrders(100);
		const data = computeSalesData(orders, "monthly");
		expect(data.length).toBeGreaterThan(0);
	});
});

describe("computeCategoryData", () => {
	it("카테고리별 데이터를 반환한다", () => {
		const orders = generateOrders(100);
		const data = computeCategoryData(orders);
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty("name");
		expect(data[0]).toHaveProperty("value");
		expect(data[0]).toHaveProperty("color");
	});
});
