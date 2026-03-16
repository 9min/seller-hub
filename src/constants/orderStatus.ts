import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	PAYMENT_COMPLETE: "결제완료",
	PREPARING: "상품준비중",
	SHIPPING: "배송중",
	DELIVERED: "배송완료",
	RETURN_REQUESTED: "반품요청",
	EXCHANGE_REQUESTED: "교환요청",
	CANCELLED: "취소",
};

export type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
	PAYMENT_COMPLETE: "info",
	PREPARING: "default",
	SHIPPING: "info",
	DELIVERED: "success",
	RETURN_REQUESTED: "warning",
	EXCHANGE_REQUESTED: "warning",
	CANCELLED: "error",
};
