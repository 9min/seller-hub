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

/**
 * 분석 데이터를 조회한다.
 * period가 "custom"이면 customDays를 RPC p_days 파라미터로 사용한다.
 */
export function useAnalyticsData(period: AnalyticsPeriod = 30, customDays?: number) {
	const effectiveDays = period === "custom" && customDays ? customDays : (period as number);

	const summary = useQuery({
		queryKey: ["analytics-summary", period, effectiveDays],
		queryFn: async () => {
			try {
				return await fetchAnalyticsSummary(effectiveDays);
			} catch {
				return computeAnalyticsSummary(FALLBACK_ORDERS, effectiveDays);
			}
		},
		placeholderData: () => computeAnalyticsSummary(FALLBACK_ORDERS, effectiveDays),
		staleTime: STALE_TIME,
		enabled: period !== "custom" || !!customDays,
	});

	const trend = useQuery({
		queryKey: ["analytics-trend", period, effectiveDays],
		queryFn: async () => {
			try {
				return await fetchAnalyticsTrend(effectiveDays);
			} catch {
				return computeAnalyticsTrend(FALLBACK_ORDERS, effectiveDays);
			}
		},
		placeholderData: () => computeAnalyticsTrend(FALLBACK_ORDERS, effectiveDays),
		staleTime: STALE_TIME,
		enabled: period !== "custom" || !!customDays,
	});

	const category = useQuery({
		queryKey: ["analytics-category", period, effectiveDays],
		queryFn: async () => {
			try {
				return await fetchAnalyticsCategory(effectiveDays);
			} catch {
				return computeAnalyticsCategory(FALLBACK_ORDERS, effectiveDays);
			}
		},
		placeholderData: () => computeAnalyticsCategory(FALLBACK_ORDERS, effectiveDays),
		staleTime: STALE_TIME,
		enabled: period !== "custom" || !!customDays,
	});

	const topProducts = useQuery({
		queryKey: ["analytics-top-products", period, effectiveDays],
		queryFn: async () => {
			try {
				return await fetchAnalyticsTopProducts(effectiveDays);
			} catch {
				return computeAnalyticsTopProducts(FALLBACK_ORDERS, effectiveDays);
			}
		},
		placeholderData: () => computeAnalyticsTopProducts(FALLBACK_ORDERS, effectiveDays),
		staleTime: STALE_TIME,
		enabled: period !== "custom" || !!customDays,
	});

	return { summary, trend, category, topProducts };
}
