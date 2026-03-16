import { useSearchParams } from "react-router-dom";
import { OrdersFilterBar } from "@/components/feature/orders/OrdersFilterBar";
import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOrdersData } from "@/hooks/useOrdersData";
import type { FetchOrdersParams, SortableColumn } from "@/services/orderService";
import type { OrderStatus } from "@/types/order";

const PAGE_SIZE = 100;

// 허용된 sortBy 값 목록 (입력 검증)
const ALLOWED_SORT_BY: SortableColumn[] = ["orderedAt", "totalPrice", "quantity"];

// 허용된 OrderStatus 값 목록 (입력 검증)
const ALLOWED_STATUSES: OrderStatus[] = [
	"PAYMENT_COMPLETE",
	"PREPARING",
	"SHIPPING",
	"DELIVERED",
	"RETURN_REQUESTED",
	"EXCHANGE_REQUESTED",
	"CANCELLED",
];

function parseOrdersSearchParams(searchParams: URLSearchParams): FetchOrdersParams {
	const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);
	const searchQuery = searchParams.get("q") ?? "";

	// statuses: 허용 목록으로 필터링 (보안 검증)
	const statusesRaw = searchParams.get("statuses") ?? "";
	const statuses = statusesRaw
		? (statusesRaw
				.split(",")
				.filter((s) => ALLOWED_STATUSES.includes(s as OrderStatus)) as OrderStatus[])
		: [];

	const startDate = searchParams.get("startDate") ?? "";
	const endDate = searchParams.get("endDate") ?? "";

	// sortBy: 허용 목록 외 값은 기본값으로 대체 (보안 검증)
	const sortByRaw = searchParams.get("sortBy") ?? "orderedAt";
	const sortBy: SortableColumn = ALLOWED_SORT_BY.includes(sortByRaw as SortableColumn)
		? (sortByRaw as SortableColumn)
		: "orderedAt";

	const sortOrderRaw = searchParams.get("sortOrder") ?? "desc";
	const sortOrder: "asc" | "desc" = sortOrderRaw === "asc" ? "asc" : "desc";

	return {
		page,
		pageSize: PAGE_SIZE,
		searchQuery,
		statuses,
		startDate,
		endDate,
		sortBy,
		sortOrder,
	};
}

export function OrdersPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const params = parseOrdersSearchParams(searchParams);
	const { orders, total, isLoading, isFetching } = useOrdersData(params);

	function setParam(key: string, value: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) {
				next.set(key, value);
			} else {
				next.delete(key);
			}
			return next;
		});
	}

	function handlePageChange(page: number) {
		setParam("page", page === 0 ? "" : String(page));
	}

	function handleSearchChange(q: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (q) {
				next.set("q", q);
			} else {
				next.delete("q");
			}
			next.delete("page"); // 검색 시 첫 페이지로 이동
			return next;
		});
	}

	function handleStatusesChange(statuses: OrderStatus[]) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (statuses.length > 0) {
				next.set("statuses", statuses.join(","));
			} else {
				next.delete("statuses");
			}
			next.delete("page");
			return next;
		});
	}

	function handleStartDateChange(date: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (date) {
				next.set("startDate", date);
			} else {
				next.delete("startDate");
			}
			next.delete("page");
			return next;
		});
	}

	function handleEndDateChange(date: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (date) {
				next.set("endDate", date);
			} else {
				next.delete("endDate");
			}
			next.delete("page");
			return next;
		});
	}

	function handleSortChange(sortBy: string, sortOrder: "asc" | "desc") {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("sortBy", sortBy);
			next.set("sortOrder", sortOrder);
			next.delete("page");
			return next;
		});
	}

	function handleReset() {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.delete("statuses");
			next.delete("startDate");
			next.delete("endDate");
			next.delete("page");
			return next;
		});
	}

	return (
		<AppLayout title="주문 관리">
			<OrdersFilterBar
				statuses={params.statuses ?? []}
				startDate={params.startDate ?? ""}
				endDate={params.endDate ?? ""}
				onStatusesChange={handleStatusesChange}
				onStartDateChange={handleStartDateChange}
				onEndDateChange={handleEndDateChange}
				onReset={handleReset}
			/>
			<OrdersTable
				orders={orders}
				total={total}
				page={params.page}
				pageSize={PAGE_SIZE}
				searchQuery={params.searchQuery ?? ""}
				onSearchChange={handleSearchChange}
				onPageChange={handlePageChange}
				sortBy={params.sortBy}
				sortOrder={params.sortOrder}
				onSortChange={handleSortChange}
				isLoading={isLoading}
				isFetching={isFetching}
			/>
		</AppLayout>
	);
}
