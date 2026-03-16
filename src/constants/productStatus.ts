import type { BadgeVariant } from "@/constants/orderStatus";
import type { ProductStatus } from "@/types/product";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
	ACTIVE: "판매중",
	SOLD_OUT: "품절",
	HIDDEN: "숨김",
};

export const PRODUCT_STATUS_VARIANT: Record<ProductStatus, BadgeVariant> = {
	ACTIVE: "success",
	SOLD_OUT: "warning",
	HIDDEN: "default",
};
