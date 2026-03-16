import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted: mock factory 내에서 참조할 수 있도록 호이스팅
const mocks = vi.hoisted(() => ({
	fetchAnalyticsSummary: vi.fn(),
	fetchAnalyticsTrend: vi.fn(),
	fetchAnalyticsCategory: vi.fn(),
	fetchAnalyticsTopProducts: vi.fn(),
}));

vi.mock("@/services/analyticsService", () => ({
	fetchAnalyticsSummary: mocks.fetchAnalyticsSummary,
	fetchAnalyticsTrend: mocks.fetchAnalyticsTrend,
	fetchAnalyticsCategory: mocks.fetchAnalyticsCategory,
	fetchAnalyticsTopProducts: mocks.fetchAnalyticsTopProducts,
}));

const MOCK_SUMMARY = {
	totalRevenue: 5000000,
	formattedTotalRevenue: "₩5,000,000",
	totalOrders: 100,
	avgUnitPrice: 50000,
	formattedAvgUnitPrice: "₩50,000",
	revenueGrowthRate: 12.5,
	trend: "up" as const,
};

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		QueryClientProvider({ client: queryClient, children });
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.fetchAnalyticsSummary.mockResolvedValue(MOCK_SUMMARY);
	mocks.fetchAnalyticsTrend.mockResolvedValue([
		{ label: "3/1", currentRevenue: 100000, previousRevenue: 80000 },
	]);
	mocks.fetchAnalyticsCategory.mockResolvedValue([
		{ name: "전자기기", revenue: 2000000, color: "#7c3aed" },
	]);
	mocks.fetchAnalyticsTopProducts.mockResolvedValue([
		{
			rank: 1,
			productName: "무선 이어버드",
			category: "전자기기",
			quantity: 50,
			revenue: 2500000,
			formattedRevenue: "₩2,500,000",
		},
	]);
});

describe("useAnalyticsData", () => {
	it("4개 쿼리 모두 데이터를 반환한다", async () => {
		const { useAnalyticsData } = await import("@/hooks/useAnalyticsData");
		const { result } = renderHook(() => useAnalyticsData(30), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.summary.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.trend.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.category.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.topProducts.isSuccess).toBe(true));

		expect(result.current.summary.data?.totalRevenue).toBe(5000000);
		expect(result.current.trend.data).toHaveLength(1);
		expect(result.current.category.data).toHaveLength(1);
		expect(result.current.topProducts.data).toHaveLength(1);
	});

	it("기본 period는 30이다", async () => {
		const { useAnalyticsData } = await import("@/hooks/useAnalyticsData");
		const { result } = renderHook(() => useAnalyticsData(), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.summary.isSuccess).toBe(true));

		expect(mocks.fetchAnalyticsSummary).toHaveBeenCalledWith(30);
	});

	it("period 변경 시 새 period로 쿼리한다", async () => {
		const { useAnalyticsData } = await import("@/hooks/useAnalyticsData");
		const { result } = renderHook(() => useAnalyticsData(7), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.summary.isSuccess).toBe(true));

		expect(mocks.fetchAnalyticsSummary).toHaveBeenCalledWith(7);
	});
});
