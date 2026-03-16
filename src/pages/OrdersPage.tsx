import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOrdersData } from "@/hooks/useOrdersData";

const PAGE_SIZE = 100;

export function OrdersPage() {
	const { orders, total, page, setPage, searchQuery, setSearchQuery, isLoading, isFetching } =
		useOrdersData();

	return (
		<AppLayout title="주문 관리">
			<OrdersTable
				orders={orders}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				searchQuery={searchQuery}
				onSearchChange={(q) => {
					setSearchQuery(q);
					setPage(0); // 검색어 변경 시 첫 페이지로
				}}
				onPageChange={setPage}
				isLoading={isLoading}
				isFetching={isFetching}
			/>
		</AppLayout>
	);
}
