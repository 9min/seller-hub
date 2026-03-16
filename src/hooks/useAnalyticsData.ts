import { useQuery } from "@tanstack/react-query";
import {
	computeAnalyticsCategory,
	computeAnalyticsSummary,
	computeAnalyticsTopProducts,
	computeAnalyticsTrend,
	generateOrders,
} from "@/constants/dummyData";
import {
	fetchAnalyticsCategory,
	fetchAnalyticsSummary,
	fetchAnalyticsTopProducts,
	fetchAnalyticsTrend,
} from "@/services/analyticsService";
import type { AnalyticsPeriod } from "@/types/analytics";

const STALE_TIME = 5 * 60 * 1000;
const FALLBACK_ORDERS = generateOrders(5_000);

export function useAnalyticsData(period: AnalyticsPeriod = 30) {
	const summary = useQuery({
		queryKey: ["analytics-summary", period],
		queryFn: () => fetchAnalyticsSummary(period),
		placeholderData: () => computeAnalyticsSummary(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const trend = useQuery({
		queryKey: ["analytics-trend", period],
		queryFn: () => fetchAnalyticsTrend(period),
		placeholderData: () => computeAnalyticsTrend(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const category = useQuery({
		queryKey: ["analytics-category", period],
		queryFn: () => fetchAnalyticsCategory(period),
		placeholderData: () => computeAnalyticsCategory(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const topProducts = useQuery({
		queryKey: ["analytics-top-products", period],
		queryFn: () => fetchAnalyticsTopProducts(period),
		placeholderData: () => computeAnalyticsTopProducts(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	return { summary, trend, category, topProducts };
}
