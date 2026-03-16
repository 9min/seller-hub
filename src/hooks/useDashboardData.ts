import { useQuery } from "@tanstack/react-query";
import {
	computeCategoryData,
	computeKpiMetrics,
	computeSalesData,
	generateOrders,
} from "@/constants/dummyData";
import type { ChartPeriod } from "@/types/chart";

const ORDERS = generateOrders(50_000);

interface DashboardData {
	kpiMetrics: ReturnType<typeof computeKpiMetrics>;
	salesData: ReturnType<typeof computeSalesData>;
	categoryData: ReturnType<typeof computeCategoryData>;
}

async function fetchDashboardData(period: ChartPeriod): Promise<DashboardData> {
	// 추후 Supabase 서비스 함수로 교체 예정
	return {
		kpiMetrics: computeKpiMetrics(ORDERS),
		salesData: computeSalesData(ORDERS, period),
		categoryData: computeCategoryData(ORDERS),
	};
}

export function useDashboardData(period: ChartPeriod = "daily") {
	return useQuery({
		queryKey: ["dashboard", period],
		queryFn: () => fetchDashboardData(period),
		staleTime: Number.POSITIVE_INFINITY,
	});
}
