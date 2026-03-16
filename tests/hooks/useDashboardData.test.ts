import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardData } from "@/hooks/useDashboardData";

// orderService mock
vi.mock("@/services/orderService", () => ({
	fetchKpiMetrics: vi.fn().mockResolvedValue([
		{
			id: "total_revenue",
			label: "총 매출",
			value: 1000000,
			formattedValue: "₩1,000,000",
			changeRate: 10,
			trend: "up",
			unit: "원",
			description: "전월 대비 +10%",
		},
		{
			id: "new_orders",
			label: "신규 주문",
			value: 100,
			formattedValue: "100",
			changeRate: 5,
			trend: "up",
			unit: "건",
			description: "전월 대비 +5%",
		},
		{
			id: "delayed",
			label: "배송 지연",
			value: 3,
			formattedValue: "3",
			changeRate: -1,
			trend: "down",
			unit: "건",
			description: "전월 대비 -1%",
		},
		{
			id: "return_rate",
			label: "반품/교환율",
			value: 2.5,
			formattedValue: "2.5%",
			changeRate: 0,
			trend: "neutral",
			unit: "%",
			description: "전월 대비 +0%p",
		},
	]),
	fetchSalesData: vi.fn().mockResolvedValue([
		{ label: "3/1", revenue: 5000000 },
		{ label: "3/2", revenue: 7000000 },
	]),
	fetchCategoryData: vi.fn().mockResolvedValue([
		{ name: "전자기기", value: 100, color: "#7c3aed" },
		{ name: "패션의류", value: 80, color: "#2563eb" },
	]),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		QueryClientProvider({ client: queryClient, children });
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useDashboardData", () => {
	it("kpi 쿼리가 KpiMetric[] 4개를 반환한다", async () => {
		const { result } = renderHook(() => useDashboardData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.kpi.isSuccess).toBe(true));

		expect(result.current.kpi.data).toHaveLength(4);
	});

	it("sales 쿼리가 SalesDataPoint[] 를 반환한다", async () => {
		const { result } = renderHook(() => useDashboardData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.sales.isSuccess).toBe(true));

		expect(result.current.sales.data?.length).toBeGreaterThan(0);
	});

	it("category 쿼리가 CategoryDataPoint[] 를 반환한다", async () => {
		const { result } = renderHook(() => useDashboardData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.category.isSuccess).toBe(true));

		expect(result.current.category.data?.length).toBeGreaterThan(0);
	});
});
