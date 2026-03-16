import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOrdersData } from "@/hooks/useOrdersData";
import { CategoryChart } from "./CategoryChart";
import { KpiSection } from "./KpiSection";
import { SalesChart } from "./SalesChart";

export function DashboardContent() {
	const { data, isLoading } = useDashboardData();
	const { orders, filteredOrders, searchQuery, setSearchQuery } = useOrdersData();

	return (
		<div className="space-y-6">
			<KpiSection metrics={data?.kpiMetrics} isLoading={isLoading} />

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SalesChart orders={orders} isLoading={isLoading} />
				<CategoryChart orders={orders} isLoading={isLoading} />
			</div>

			<OrdersTable
				orders={filteredOrders}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>
		</div>
	);
}
