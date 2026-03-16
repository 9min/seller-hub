import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_VARIANT } from "@/constants/productStatus";
import type { ProductStatus } from "@/types/product";

interface ProductStatusBadgeProps {
	status: ProductStatus;
}

export const ProductStatusBadge = memo(function ProductStatusBadge({
	status,
}: ProductStatusBadgeProps) {
	return <Badge variant={PRODUCT_STATUS_VARIANT[status]}>{PRODUCT_STATUS_LABEL[status]}</Badge>;
});
