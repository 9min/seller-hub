import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { OrdersFilterBar } from "@/components/feature/orders/OrdersFilterBar";
import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABEL } from "@/constants/orderStatus";
import { useOrdersData } from "@/hooks/useOrdersData";
import { usePermission } from "@/hooks/usePermission";
import type { FetchOrdersParams, SortableColumn } from "@/services/orderService";
import type { OrderStatus } from "@/types/order";
import { exportToCSV } from "@/utils/csvExport";

const PAGE_SIZE = 100;

// 허용된 sortBy 값 목록 (입력 검증)
const ALLOWED_SORT_BY: SortableColumn[] = ["orderedAt", "totalPrice", "quantity"];

// ORDER_STATUS_LABEL 키에서 파생 — 신규 상태 추가 시 한 곳만 수정
const ALLOWED_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

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
	const canExport = usePermission("orders", "export");

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

	const handleSearchChange = useCallback(
		(q: string) => {
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
		},
		[setSearchParams],
	);

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

	function handleExportCSV() {
		exportToCSV(orders, `orders_${new Date().toISOString().split("T")[0]}`, [
			{ key: "orderNumber", header: "주문번호" },
			{ key: "orderedAt", header: "주문일시" },
			{ key: "buyerName", header: "구매자" },
			{ key: "productName", header: "상품명" },
			{ key: "category", header: "카테고리" },
			{ key: "quantity", header: "수량" },
			{ key: "unitPrice", header: "단가" },
			{ key: "totalPrice", header: "총액" },
			{ key: "status", header: "상태" },
		]);
	}

	return (
		<AppLayout title="주문 관리">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
				<OrdersFilterBar
					statuses={params.statuses ?? []}
					startDate={params.startDate ?? ""}
					endDate={params.endDate ?? ""}
					onStatusesChange={handleStatusesChange}
					onStartDateChange={handleStartDateChange}
					onEndDateChange={handleEndDateChange}
					onReset={handleReset}
				/>
				{canExport && (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleExportCSV}
						disabled={orders.length === 0}
					>
						CSV 다운로드
					</Button>
				)}
			</div>
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
