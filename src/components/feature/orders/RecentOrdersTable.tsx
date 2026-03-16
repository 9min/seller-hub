import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Order, OrderStatus } from "@/types/order";
import { formatDateTime } from "@/utils/formatDate";
import { formatCount } from "@/utils/formatNumber";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface RecentOrdersTableProps {
	orders: Order[];
	total: number;
	isLoading?: boolean;
}

const PREVIEW_COUNT = 5;

export function RecentOrdersTable({ orders, total, isLoading }: RecentOrdersTableProps) {
	const preview = orders.slice(0, PREVIEW_COUNT);

	return (
		<Card className="p-0 overflow-hidden">
			{/* 헤더 */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-gray-700">최근 주문</h2>
					{!isLoading && (
						<span className="text-xs text-gray-400 tabular-nums">전체 {formatCount(total)}건</span>
					)}
				</div>
				<Link
					to="/orders"
					className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
				>
					전체 보기 →
				</Link>
			</div>

			{/* 테이블 */}
			{isLoading ? (
				<div className="p-4 space-y-2">
					{Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: 스켈레톤 목록이라 index 사용
						<Skeleton key={i} className="h-10" />
					))}
				</div>
			) : (
				<table className="w-full text-sm">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-40">
								주문번호
							</th>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-36">
								주문일시
							</th>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-24">
								구매자명
							</th>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
								상품명
							</th>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-28">
								금액
							</th>
							<th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-28">
								상태
							</th>
						</tr>
					</thead>
					<tbody>
						{preview.map((order) => (
							<tr
								key={order.id}
								className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
							>
								<td className="px-4 py-3 text-gray-700 font-mono text-xs truncate">
									{order.orderNumber}
								</td>
								<td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
									{formatDateTime(order.orderedAt)}
								</td>
								<td className="px-4 py-3 text-gray-700">{order.buyerName}</td>
								<td className="px-4 py-3 text-gray-700 truncate max-w-0">{order.productName}</td>
								<td className="px-4 py-3 text-gray-700 tabular-nums whitespace-nowrap">
									{new Intl.NumberFormat("ko-KR", {
										style: "currency",
										currency: "KRW",
										maximumFractionDigits: 0,
									}).format(order.totalPrice)}
								</td>
								<td className="px-4 py-3">
									<OrderStatusBadge status={order.status as OrderStatus} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</Card>
	);
}
