import { useQuery } from "@tanstack/react-query";
import {
	computeAnalyticsCategory,
	computeAnalyticsSummary,
	computeAnalyticsTopProducts,
	computeAnalyticsTrend,
} from "@/constants/dummyData";
import { FALLBACK_ORDERS } from "@/constants/fallbackData";
import {
	fetchAnalyticsCategory,
	fetchAnalyticsSummary,
	fetchAnalyticsTopProducts,
	fetchAnalyticsTrend,
} from "@/services/analyticsService";
import type { AnalyticsPeriod } from "@/types/analytics";

const STALE_TIME = 5 * 60 * 1000;

export function useAnalyticsData(period: AnalyticsPeriod = 30) {
	const summary = useQuery({
		queryKey: ["analytics-summary", period],
		queryFn: async () => {
			try {
				return await fetchAnalyticsSummary(period);
			} catch {
				return computeAnalyticsSummary(FALLBACK_ORDERS, period);
			}
		},
		placeholderData: () => computeAnalyticsSummary(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const trend = useQuery({
		queryKey: ["analytics-trend", period],
		queryFn: async () => {
			try {
				return await fetchAnalyticsTrend(period);
			} catch {
				return computeAnalyticsTrend(FALLBACK_ORDERS, period);
			}
		},
		placeholderData: () => computeAnalyticsTrend(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const category = useQuery({
		queryKey: ["analytics-category", period],
		queryFn: async () => {
			try {
				return await fetchAnalyticsCategory(period);
			} catch {
				return computeAnalyticsCategory(FALLBACK_ORDERS, period);
			}
		},
		placeholderData: () => computeAnalyticsCategory(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	const topProducts = useQuery({
		queryKey: ["analytics-top-products", period],
		queryFn: async () => {
			try {
				return await fetchAnalyticsTopProducts(period);
			} catch {
				return computeAnalyticsTopProducts(FALLBACK_ORDERS, period);
			}
		},
		placeholderData: () => computeAnalyticsTopProducts(FALLBACK_ORDERS, period),
		staleTime: STALE_TIME,
	});

	return { summary, trend, category, topProducts };
}
