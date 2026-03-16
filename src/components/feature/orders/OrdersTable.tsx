import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { Order, OrderStatus } from "@/types/order";
import { formatDateTime } from "@/utils/formatDate";
import { formatCount } from "@/utils/formatNumber";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersTableProps {
	orders: Order[];
	total: number;
	page: number;
	pageSize: number;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	isFetching?: boolean;
}

const ROW_HEIGHT = 48;
const TABLE_HEIGHT = 560;

export const OrdersTable = memo(function OrdersTable({
	orders,
	total,
	page,
	pageSize,
	searchQuery,
	onSearchChange,
	onPageChange,
	isLoading,
	isFetching,
}: OrdersTableProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const columns = useMemo<ColumnDef<Order>[]>(
		() => [
			{
				accessorKey: "orderNumber",
				header: "주문번호",
				size: 160,
			},
			{
				accessorKey: "orderedAt",
				header: "주문일시",
				size: 160,
				cell: ({ getValue }) => formatDateTime(getValue<string>()),
			},
			{
				accessorKey: "buyerName",
				header: "구매자명",
				size: 100,
			},
			{
				accessorKey: "productName",
				header: "상품명",
				size: 200,
			},
			{
				accessorKey: "category",
				header: "카테고리",
				size: 100,
			},
			{
				accessorKey: "quantity",
				header: "수량",
				size: 60,
			},
			{
				accessorKey: "totalPrice",
				header: "금액",
				size: 120,
				cell: ({ getValue }) =>
					new Intl.NumberFormat("ko-KR", {
						style: "currency",
						currency: "KRW",
						maximumFractionDigits: 0,
					}).format(getValue<number>()),
			},
			{
				accessorKey: "status",
				header: "상태",
				size: 110,
				cell: ({ getValue }) => <OrderStatusBadge status={getValue<OrderStatus>()} />,
			},
		],
		[],
	);

	const table = useReactTable({
		data: orders,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rows = table.getRowModel().rows;

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => ROW_HEIGHT,
		overscan: 10,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	return (
		<Card className="p-0 overflow-hidden">
			{/* 툴바 */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-gray-700">주문 목록</h2>
					<span className="text-xs text-gray-400 tabular-nums">{formatCount(total)}건</span>
				</div>
				<input
					type="search"
					placeholder="주문번호, 구매자명, 상품명 검색"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
				/>
			</div>

			{/* 가상화 테이블 */}
			<div ref={parentRef} style={{ height: TABLE_HEIGHT, overflowY: "auto" }}>
				{isLoading ? (
					<div className="flex items-center justify-center h-full text-sm text-gray-400">
						데이터를 불러오는 중...
					</div>
				) : (
					<table className="w-full text-sm border-collapse">
						<thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											style={{ width: header.getSize() }}
											className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody
							style={{
								height: `${totalSize}px`,
								position: "relative",
							}}
						>
							{virtualItems.map((virtualRow) => {
								const row = rows[virtualRow.index];
								if (!row) return null;
								return (
									<tr
										key={row.id}
										style={{
											position: "absolute",
											top: 0,
											transform: `translateY(${virtualRow.start}px)`,
											height: `${virtualRow.size}px`,
											width: "100%",
											display: "flex",
											alignItems: "center",
										}}
										className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												style={{ width: cell.column.getSize(), flexShrink: 0 }}
												className="px-3 py-2 text-gray-700 truncate"
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			{/* 페이지네이션 */}
			<Pagination
				page={page}
				pageSize={pageSize}
				total={total}
				onPageChange={onPageChange}
				isFetching={isFetching}
			/>
		</Card>
	);
});
