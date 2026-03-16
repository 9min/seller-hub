import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/constants/orderStatus";
import { supabase } from "@/lib/supabase";
import type { CategoryDataPoint, ChartPeriod, SalesDataPoint } from "@/types/chart";
import type { KpiMetric, KpiTrend } from "@/types/kpi";
import type { Order } from "@/types/order";
import { formatCount, formatCurrency, formatPercent } from "@/utils/formatNumber";

export interface FetchOrdersParams {
	page: number; // 0-based
	pageSize: number; // 기본값 100
	searchQuery?: string;
}

export interface FetchOrdersResult {
	orders: Order[];
	total: number;
}

// DB 행(snake_case) → Order 도메인 타입(camelCase) 변환
function rowToOrder(row: Record<string, unknown>): Order {
	return {
		id: row.id as string,
		orderNumber: row.order_number as string,
		buyerName: row.buyer_name as string,
		productName: row.product_name as string,
		category: row.category as string,
		quantity: row.quantity as number,
		unitPrice: row.unit_price as number,
		totalPrice: row.total_price as number,
		status: row.status as Order["status"],
		orderedAt: row.ordered_at as string,
		shippedAt: row.shipped_at as string | null,
		deliveredAt: row.delivered_at as string | null,
		isDelayed: row.is_delayed as boolean,
	};
}

export async function fetchOrders(params: FetchOrdersParams): Promise<FetchOrdersResult> {
	const { page, pageSize, searchQuery } = params;

	let query = supabase
		.from("orders")
		.select("*", { count: "exact" })
		.order("ordered_at", { ascending: false })
		.range(page * pageSize, (page + 1) * pageSize - 1);

	if (searchQuery?.trim()) {
		const q = searchQuery.trim();
		query = query.or(`order_number.ilike.%${q}%,buyer_name.ilike.%${q}%,product_name.ilike.%${q}%`);
	}

	const { data, error, count } = await query;
	if (error) {
		// PGRST103: 요청한 range가 전체 행 수를 초과 (빈 테이블 또는 마지막 페이지 이후)
		if (error.code === "PGRST103") {
			return { orders: [], total: 0 };
		}
		throw error;
	}

	return {
		orders: ((data ?? []) as Record<string, unknown>[]).map(rowToOrder),
		total: count ?? 0,
	};
}

export async function fetchKpiMetrics(): Promise<KpiMetric[]> {
	const { data, error } = await supabase.rpc("get_kpi_metrics");
	if (error) throw error;

	const rows = data as Array<{
		id: string;
		label: string;
		value: number;
		changeRate: number;
		unit: string;
	}>;

	return rows.map((row) => {
		const changeRate = row.changeRate;
		const trend: KpiTrend = changeRate > 0 ? "up" : changeRate < 0 ? "down" : "neutral";

		let formattedValue: string;
		if (row.id === "total_revenue") {
			formattedValue = formatCurrency(row.value);
		} else if (row.id === "return_rate") {
			formattedValue = formatPercent(row.value);
		} else {
			formattedValue = formatCount(row.value);
		}

		const absRate = Math.abs(changeRate);
		const sign = changeRate >= 0 ? "+" : "-";
		const suffix = row.id === "return_rate" ? "%p" : "%";
		const description = `전월 대비 ${sign}${absRate}${suffix}`;

		return {
			id: row.id,
			label: row.label,
			value: row.value,
			formattedValue,
			changeRate,
			trend,
			unit: row.unit,
			description,
		};
	});
}

export async function fetchSalesData(period: ChartPeriod): Promise<SalesDataPoint[]> {
	const { data, error } = await supabase.rpc("get_sales_data", { p_period: period });
	if (error) throw error;

	const rows = data as Array<{ label: string; revenue: number }>;
	return rows.map((row) => ({ label: row.label, revenue: row.revenue }));
}

export async function fetchCategoryData(): Promise<CategoryDataPoint[]> {
	const { data, error } = await supabase.rpc("get_category_data");
	if (error) throw error;

	const rows = data as Array<{ name: string; value: number }>;
	return rows.map((row) => ({
		name: row.name,
		value: row.value,
		color: CATEGORY_COLORS[row.name] ?? DEFAULT_CATEGORY_COLOR,
	}));
}
