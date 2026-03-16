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

export const CATEGORY_COLORS: Record<string, string> = {
	패션의류: "#2563eb",
	전자기기: "#7c3aed",
	뷰티: "#059669",
	스포츠: "#d97706",
	홈리빙: "#dc2626",
	식품: "#0891b2",
};

export const DEFAULT_CATEGORY_COLOR = "#2563eb";
