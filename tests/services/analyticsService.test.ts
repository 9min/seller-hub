import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase", () => ({
	supabase: { rpc: mockRpc },
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("analyticsService", () => {
	describe("fetchAnalyticsSummary", () => {
		it("정상 데이터 반환", async () => {
			mockRpc.mockResolvedValueOnce({
				data: [
					{
						total_revenue: 5000000,
						total_orders: 100,
						avg_unit_price: 50000,
						revenue_growth_rate: 12.5,
					},
				],
				error: null,
			});

			const { fetchAnalyticsSummary } = await import("@/services/analyticsService");
			const result = await fetchAnalyticsSummary(30);

			expect(result.totalRevenue).toBe(5000000);
			expect(result.totalOrders).toBe(100);
			expect(result.revenueGrowthRate).toBe(12.5);
			expect(result.trend).toBe("up");
			expect(result.formattedTotalRevenue).toContain("5,000,000");
		});

		it("p_days 파라미터 전달", async () => {
			mockRpc.mockResolvedValueOnce({
				data: [{ total_revenue: 0, total_orders: 0, avg_unit_price: 0, revenue_growth_rate: 0 }],
				error: null,
			});

			const { fetchAnalyticsSummary } = await import("@/services/analyticsService");
			await fetchAnalyticsSummary(7);

			expect(mockRpc).toHaveBeenCalledWith("get_analytics_summary", { p_days: 7 });
		});

		it("에러 시 throw", async () => {
			mockRpc.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });

			const { fetchAnalyticsSummary } = await import("@/services/analyticsService");
			await expect(fetchAnalyticsSummary(30)).rejects.toBeTruthy();
		});
	});

	describe("fetchAnalyticsTrend", () => {
		it("정상 데이터 반환 및 변환", async () => {
			mockRpc.mockResolvedValueOnce({
				data: [
					{ day_index: 1, label: "3/1", current_revenue: 100000, previous_revenue: 80000 },
					{ day_index: 2, label: "3/2", current_revenue: 120000, previous_revenue: 90000 },
				],
				error: null,
			});

			const { fetchAnalyticsTrend } = await import("@/services/analyticsService");
			const result = await fetchAnalyticsTrend(30);

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				label: "3/1",
				currentRevenue: 100000,
				previousRevenue: 80000,
			});
		});

		it("p_days 파라미터 전달", async () => {
			mockRpc.mockResolvedValueOnce({ data: [], error: null });

			const { fetchAnalyticsTrend } = await import("@/services/analyticsService");
			await fetchAnalyticsTrend(90);

			expect(mockRpc).toHaveBeenCalledWith("get_analytics_trend", { p_days: 90 });
		});
	});

	describe("fetchAnalyticsCategory", () => {
		it("카테고리 색상 매핑 포함하여 반환", async () => {
			mockRpc.mockResolvedValueOnce({
				data: [{ name: "전자기기", revenue: 2000000 }],
				error: null,
			});

			const { fetchAnalyticsCategory } = await import("@/services/analyticsService");
			const result = await fetchAnalyticsCategory(30);

			expect(result[0]).toMatchObject({ name: "전자기기", revenue: 2000000 });
			expect(result[0]?.color).toBeTruthy();
		});
	});

	describe("fetchAnalyticsTopProducts", () => {
		it("순위 포함 정상 데이터 반환", async () => {
			mockRpc.mockResolvedValueOnce({
				data: [
					{
						rank: 1,
						product_name: "무선 이어버드",
						category: "전자기기",
						quantity: 50,
						revenue: 2500000,
					},
				],
				error: null,
			});

			const { fetchAnalyticsTopProducts } = await import("@/services/analyticsService");
			const result = await fetchAnalyticsTopProducts(30);

			expect(result[0]).toMatchObject({
				rank: 1,
				productName: "무선 이어버드",
				category: "전자기기",
				quantity: 50,
				revenue: 2500000,
			});
			expect(result[0]?.formattedRevenue).toContain("2,500,000");
		});
	});
});
