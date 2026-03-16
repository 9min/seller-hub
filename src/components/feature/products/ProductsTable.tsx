import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import type { Product, ProductStatus } from "@/types/product";
import { formatCount, formatCurrency } from "@/utils/formatNumber";
import { ProductStatusBadge } from "./ProductStatusBadge";

interface ProductsTableProps {
	products: Product[];
	total: number;
	page: number;
	pageSize: number;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onPageChange: (page: number) => void;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
	isLoading?: boolean;
	isFetching?: boolean;
}

const ROW_HEIGHT = 48;
const TABLE_HEIGHT = 560;

function SortIcon({
	columnId,
	sortBy,
	sortOrder,
}: {
	columnId: string;
	sortBy: string;
	sortOrder: "asc" | "desc";
}) {
	if (columnId !== sortBy) return <span className="ml-1 text-gray-300">↕</span>;
	return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
}

export const ProductsTable = memo(function ProductsTable({
	products,
	total,
	page,
	pageSize,
	searchQuery,
	onSearchChange,
	onPageChange,
	sortBy = "",
	sortOrder = "asc",
	onSortChange,
	isLoading,
	isFetching,
}: ProductsTableProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const sorting: SortingState = sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [];

	const columns = useMemo<ColumnDef<Product>[]>(
		() => [
			{
				accessorKey: "sku",
				header: "SKU",
				size: 120,
				enableSorting: false,
			},
			{
				accessorKey: "name",
				header: "상품명",
				size: 220,
				enableSorting: true,
			},
			{
				accessorKey: "category",
				header: "카테고리",
				size: 100,
				enableSorting: false,
			},
			{
				accessorKey: "unitPrice",
				header: "단가",
				size: 110,
				enableSorting: true,
				cell: ({ getValue }) => formatCurrency(getValue<number>()),
			},
			{
				accessorKey: "stock",
				header: "재고",
				size: 80,
				enableSorting: true,
				cell: ({ getValue }) => formatCount(getValue<number>()),
			},
			{
				accessorKey: "salesCount",
				header: "판매량",
				size: 80,
				enableSorting: true,
				cell: ({ getValue }) => formatCount(getValue<number>()),
			},
			{
				accessorKey: "status",
				header: "상태",
				size: 80,
				enableSorting: false,
				cell: ({ getValue }) => <ProductStatusBadge status={getValue<ProductStatus>()} />,
			},
		],
		[],
	);

	const table = useReactTable({
		data: products,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualSorting: true,
		state: { sorting },
		onSortingChange: (updater) => {
			const newSorting = typeof updater === "function" ? updater(sorting) : updater;
			if (newSorting.length > 0 && onSortChange) {
				const first = newSorting[0];
				if (first) onSortChange(first.id, first.desc ? "desc" : "asc");
			} else if (newSorting.length === 0 && onSortChange) {
				onSortChange("name", "asc");
			}
		},
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
		<Card className="overflow-hidden p-0">
			{/* 툴바 */}
			<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-gray-700">상품 목록</h2>
					<span className="tabular-nums text-xs text-gray-400">{formatCount(total)}건</span>
				</div>
				<input
					type="search"
					placeholder="상품명, SKU 검색"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
				/>
			</div>

			{/* 가상화 테이블 */}
			<div ref={parentRef} style={{ height: TABLE_HEIGHT, overflowY: "auto" }}>
				{isLoading ? (
					<div className="flex h-full items-center justify-center text-sm text-gray-400">
						데이터를 불러오는 중...
					</div>
				) : (
					<table className="w-full border-collapse text-sm">
						<thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const canSort = header.column.getCanSort();
										return (
											<th
												key={header.id}
												style={{ width: header.getSize() }}
												className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
											>
												{canSort ? (
													<button
														type="button"
														onClick={header.column.getToggleSortingHandler()}
														className="flex items-center gap-0.5 transition-colors hover:text-gray-700"
													>
														{flexRender(header.column.columnDef.header, header.getContext())}
														<SortIcon columnId={header.id} sortBy={sortBy} sortOrder={sortOrder} />
													</button>
												) : (
													flexRender(header.column.columnDef.header, header.getContext())
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody style={{ height: `${totalSize}px`, position: "relative" }}>
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
										className="border-b border-gray-100 transition-colors hover:bg-gray-50"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												style={{ width: cell.column.getSize(), flexShrink: 0 }}
												className="truncate px-3 py-2 text-gray-700"
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
