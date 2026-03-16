import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/constants/orderStatus";
import { supabase } from "@/lib/supabase";
import type {
	AnalyticsCategoryPoint,
	AnalyticsPeriod,
	AnalyticsSummary,
	AnalyticsTopProduct,
	AnalyticsTrendPoint,
} from "@/types/analytics";
import { formatCurrency } from "@/utils/formatNumber";

export async function fetchAnalyticsSummary(days: AnalyticsPeriod): Promise<AnalyticsSummary> {
	const { data, error } = await supabase.rpc("get_analytics_summary", { p_days: days });
	if (error) throw error;

	const row = (data as Array<Record<string, number>>)[0] ?? {
		total_revenue: 0,
		total_orders: 0,
		avg_unit_price: 0,
		revenue_growth_rate: 0,
	};

	const totalRevenue = Number(row.total_revenue);
	const totalOrders = Number(row.total_orders);
	const avgUnitPrice = Number(row.avg_unit_price);
	const revenueGrowthRate = Number(row.revenue_growth_rate);

	return {
		totalRevenue,
		formattedTotalRevenue: formatCurrency(totalRevenue),
		totalOrders,
		avgUnitPrice,
		formattedAvgUnitPrice: formatCurrency(avgUnitPrice),
		revenueGrowthRate,
		trend: revenueGrowthRate > 0 ? "up" : revenueGrowthRate < 0 ? "down" : "neutral",
	};
}

export async function fetchAnalyticsTrend(days: AnalyticsPeriod): Promise<AnalyticsTrendPoint[]> {
	const { data, error } = await supabase.rpc("get_analytics_trend", { p_days: days });
	if (error) throw error;

	const rows = data as Array<{
		day_index: number;
		label: string;
		current_revenue: number;
		previous_revenue: number;
	}>;

	return rows.map((row) => ({
		label: row.label,
		currentRevenue: Number(row.current_revenue),
		previousRevenue: Number(row.previous_revenue),
	}));
}

export async function fetchAnalyticsCategory(
	days: AnalyticsPeriod,
): Promise<AnalyticsCategoryPoint[]> {
	const { data, error } = await supabase.rpc("get_analytics_category", { p_days: days });
	if (error) throw error;

	const rows = data as Array<{ name: string; revenue: number }>;

	return rows.map((row) => ({
		name: row.name,
		revenue: Number(row.revenue),
		color: CATEGORY_COLORS[row.name] ?? DEFAULT_CATEGORY_COLOR,
	}));
}

export async function fetchAnalyticsTopProducts(
	days: AnalyticsPeriod,
): Promise<AnalyticsTopProduct[]> {
	const { data, error } = await supabase.rpc("get_analytics_top_products", { p_days: days });
	if (error) throw error;

	const rows = data as Array<{
		rank: number;
		product_name: string;
		category: string;
		quantity: number;
		revenue: number;
	}>;

	return rows.map((row) => ({
		rank: Number(row.rank),
		productName: row.product_name,
		category: row.category,
		quantity: Number(row.quantity),
		revenue: Number(row.revenue),
		formattedRevenue: formatCurrency(Number(row.revenue)),
	}));
}
