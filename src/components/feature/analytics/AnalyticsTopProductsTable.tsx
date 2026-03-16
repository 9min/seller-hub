import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AnalyticsTopProduct } from "@/types/analytics";
import { formatCount } from "@/utils/formatNumber";

interface AnalyticsTopProductsTableProps {
	topProducts: AnalyticsTopProduct[] | undefined;
	isLoading?: boolean;
}

export function AnalyticsTopProductsTable({
	topProducts,
	isLoading,
}: AnalyticsTopProductsTableProps) {
	const columns = useMemo<ColumnDef<AnalyticsTopProduct>[]>(
		() => [
			{
				accessorKey: "rank",
				header: "순위",
				size: 48,
				cell: ({ getValue }) => (
					<span className="font-semibold text-violet-600">#{getValue<number>()}</span>
				),
			},
			{ accessorKey: "productName", header: "상품명", size: 180 },
			{ accessorKey: "category", header: "카테고리", size: 90 },
			{
				accessorKey: "quantity",
				header: "판매량",
				size: 70,
				cell: ({ getValue }) => formatCount(getValue<number>()),
			},
			{
				accessorKey: "formattedRevenue",
				header: "매출",
				size: 110,
			},
		],
		[],
	);

	const table = useReactTable({
		data: topProducts ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) return <Skeleton className="h-80" />;

	return (
		<Card className="overflow-hidden p-0">
			<div className="border-b border-gray-200 px-4 py-3">
				<h2 className="text-sm font-semibold text-gray-700">상품별 매출 순위 Top 10</h2>
			</div>
			<table className="w-full text-sm">
				<thead className="border-b border-gray-200 bg-gray-50">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									style={{ width: header.getSize() }}
									className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
								>
									{flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									style={{ width: cell.column.getSize() }}
									className="truncate px-3 py-2.5 text-gray-700"
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</Card>
	);
}
