import type { KpiTrend } from "@/types/kpi";

export type AnalyticsPeriod = 7 | 30 | 90 | "custom";

export interface AnalyticsSummary {
	totalRevenue: number;
	formattedTotalRevenue: string;
	totalOrders: number;
	avgUnitPrice: number;
	formattedAvgUnitPrice: string;
	revenueGrowthRate: number;
	trend: KpiTrend;
}

export interface AnalyticsTrendPoint {
	label: string;
	currentRevenue: number;
	previousRevenue: number;
}

export interface AnalyticsCategoryPoint {
	name: string;
	revenue: number;
	color: string;
}

export interface AnalyticsTopProduct {
	rank: number;
	productName: string;
	category: string;
	quantity: number;
	revenue: number;
	formattedRevenue: string;
}
