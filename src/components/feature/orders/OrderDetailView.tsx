import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ORDER_STATUS_LABEL } from "@/constants/orderStatus";
import { useUpdateOrderStatus } from "@/hooks/useUpdateOrderStatus";
import type { Order, OrderStatus } from "@/types/order";
import { formatDateTime } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatNumber";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailViewProps {
	order: Order;
}

const ALL_STATUSES: OrderStatus[] = [
	"PAYMENT_COMPLETE",
	"PREPARING",
	"SHIPPING",
	"DELIVERED",
	"RETURN_REQUESTED",
	"EXCHANGE_REQUESTED",
	"CANCELLED",
];

export function OrderDetailView({ order }: OrderDetailViewProps) {
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
	const mutation = useUpdateOrderStatus();

	const handleStatusChange = () => {
		if (selectedStatus !== order.status) {
			mutation.mutate({ id: order.id, status: selectedStatus });
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700">
						← 주문 목록
					</Link>
					<h2 className="text-lg font-semibold text-gray-900">주문 {order.orderNumber}</h2>
					<OrderStatusBadge status={order.status} />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<Card className="p-6">
					<h3 className="mb-4 text-sm font-semibold text-gray-900">주문 정보</h3>
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between">
							<dt className="text-gray-500">주문번호</dt>
							<dd className="font-medium text-gray-900">{order.orderNumber}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-gray-500">주문일시</dt>
							<dd className="text-gray-900">{formatDateTime(order.orderedAt)}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-gray-500">구매자</dt>
							<dd className="text-gray-900">{order.buyerName}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-gray-500">카테고리</dt>
							<dd className="text-gray-900">{order.category}</dd>
						</div>
					</dl>
				</Card>

				<Card className="p-6">
					<h3 className="mb-4 text-sm font-semibold text-gray-900">상품/결제 정보</h3>
					<dl className="space-y-3 text-sm">
						<div className="flex justify-between">
							<dt className="text-gray-500">상품명</dt>
							<dd className="font-medium text-gray-900">{order.productName}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-gray-500">단가</dt>
							<dd className="text-gray-900">{formatCurrency(order.unitPrice)}</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-gray-500">수량</dt>
							<dd className="text-gray-900">{order.quantity}개</dd>
						</div>
						<div className="flex justify-between border-t pt-3">
							<dt className="font-medium text-gray-700">총 금액</dt>
							<dd className="font-semibold text-gray-900">{formatCurrency(order.totalPrice)}</dd>
						</div>
					</dl>
				</Card>
			</div>

			<Card className="p-6">
				<h3 className="mb-4 text-sm font-semibold text-gray-900">배송 정보</h3>
				<dl className="grid grid-cols-3 gap-4 text-sm">
					<div>
						<dt className="text-gray-500">배송 상태</dt>
						<dd className="mt-1">
							{order.isDelayed ? (
								<span className="text-red-600 font-medium">지연</span>
							) : (
								<span className="text-green-600 font-medium">정상</span>
							)}
						</dd>
					</div>
					<div>
						<dt className="text-gray-500">출고일</dt>
						<dd className="mt-1 text-gray-900">
							{order.shippedAt ? formatDateTime(order.shippedAt) : "-"}
						</dd>
					</div>
					<div>
						<dt className="text-gray-500">배송완료일</dt>
						<dd className="mt-1 text-gray-900">
							{order.deliveredAt ? formatDateTime(order.deliveredAt) : "-"}
						</dd>
					</div>
				</dl>
			</Card>

			<Card className="p-6">
				<h3 className="mb-4 text-sm font-semibold text-gray-900">상태 변경</h3>
				<div className="flex items-center gap-3">
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
					>
						{ALL_STATUSES.map((s) => (
							<option key={s} value={s}>
								{ORDER_STATUS_LABEL[s]}
							</option>
						))}
					</select>
					<Button
						size="sm"
						disabled={selectedStatus === order.status || mutation.isPending}
						onClick={handleStatusChange}
					>
						{mutation.isPending ? "변경 중..." : "상태 변경"}
					</Button>
				</div>
			</Card>
		</div>
	);
}
