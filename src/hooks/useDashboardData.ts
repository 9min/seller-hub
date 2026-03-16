import { useQuery } from "@tanstack/react-query";
import { computeCategoryData, computeKpiMetrics, computeSalesData } from "@/constants/dummyData";
import { FALLBACK_ORDERS } from "@/constants/fallbackData";
import { fetchCategoryData, fetchKpiMetrics, fetchSalesData } from "@/services/orderService";
import type { ChartPeriod } from "@/types/chart";

const FALLBACK_KPI = computeKpiMetrics(FALLBACK_ORDERS);
const FALLBACK_CATEGORY = computeCategoryData(FALLBACK_ORDERS);

export function useDashboardData(period: ChartPeriod = "daily") {
	const kpi = useQuery({
		queryKey: ["kpi"],
		queryFn: async () => {
			try {
				const result = await fetchKpiMetrics();
				// DB가 비어있으면 더미 데이터 유지
				return result.some((k) => k.value > 0) ? result : FALLBACK_KPI;
			} catch {
				return FALLBACK_KPI;
			}
		},
		initialData: FALLBACK_KPI,
		initialDataUpdatedAt: 0,
		staleTime: 1000 * 60 * 5,
	});

	const sales = useQuery({
		queryKey: ["sales", period],
		queryFn: async () => {
			try {
				const result = await fetchSalesData(period);
				return result.length > 0 ? result : computeSalesData(FALLBACK_ORDERS, period);
			} catch {
				return computeSalesData(FALLBACK_ORDERS, period);
			}
		},
		initialData: () => computeSalesData(FALLBACK_ORDERS, period),
		initialDataUpdatedAt: 0,
		staleTime: 1000 * 60 * 5,
	});

	const category = useQuery({
		queryKey: ["category"],
		queryFn: async () => {
			try {
				const result = await fetchCategoryData();
				return result.length > 0 ? result : FALLBACK_CATEGORY;
			} catch {
				return FALLBACK_CATEGORY;
			}
		},
		initialData: FALLBACK_CATEGORY,
		initialDataUpdatedAt: 0,
		staleTime: 1000 * 60 * 5,
	});

	return { kpi, sales, category };
}
