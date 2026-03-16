import { memo, useState } from "react";
import { RecentOrdersTable } from "@/components/feature/orders/RecentOrdersTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOrdersData } from "@/hooks/useOrdersData";
import type { ChartPeriod } from "@/types/chart";
import { CategoryChart } from "./CategoryChart";
import { KpiSection } from "./KpiSection";
import { SalesChart } from "./SalesChart";

export const DashboardContent = memo(function DashboardContent() {
	const [period, setPeriod] = useState<ChartPeriod>("daily");
	const { kpi, sales, category } = useDashboardData(period);
	const { orders, total, isLoading } = useOrdersData({ page: 0, pageSize: 5 });

	return (
		<div className="space-y-6">
			<KpiSection metrics={kpi.data} isLoading={kpi.isLoading} />

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SalesChart
					salesData={sales.data}
					period={period}
					onPeriodChange={setPeriod}
					isLoading={sales.isLoading}
				/>
				<CategoryChart categoryData={category.data} isLoading={category.isLoading} />
			</div>

			<RecentOrdersTable orders={orders} total={total} isLoading={isLoading} />
		</div>
	);
});
