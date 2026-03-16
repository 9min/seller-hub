import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/constants/orderStatus";
import type { OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
	status: OrderStatus;
}

export const OrderStatusBadge = memo(function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	return <Badge variant={ORDER_STATUS_VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
});
