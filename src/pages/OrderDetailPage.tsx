import { useParams } from "react-router-dom";
import { OrderDetailView } from "@/components/feature/orders/OrderDetailView";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOrderDetail } from "@/hooks/useOrderDetail";

export function OrderDetailPage() {
	const { id = "" } = useParams<{ id: string }>();
	const { order, isLoading, error } = useOrderDetail(id);

	return (
		<AppLayout title="주문 상세">
			{isLoading && (
				<div className="flex items-center justify-center h-64 text-sm text-gray-400">
					주문 정보를 불러오는 중...
				</div>
			)}
			{error && (
				<div className="flex items-center justify-center h-64 text-sm text-red-500">
					주문을 찾을 수 없습니다.
				</div>
			)}
			{order && <OrderDetailView order={order} />}
		</AppLayout>
	);
}
