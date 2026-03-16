import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useOrdersData } from "@/hooks/useOrdersData";

describe("useOrdersData", () => {
	it("주문 데이터를 반환한다", () => {
		const { result } = renderHook(() => useOrdersData());
		expect(result.current.orders.length).toBeGreaterThan(0);
	});

	it("검색어로 filteredOrders가 필터링된다", () => {
		const { result } = renderHook(() => useOrdersData());
		const firstOrder = result.current.orders[0];
		if (!firstOrder) return;

		act(() => {
			result.current.setSearchQuery(firstOrder.buyerName);
		});

		expect(
			result.current.filteredOrders.every((o) => o.buyerName.includes(firstOrder.buyerName)),
		).toBe(true);
	});
});
