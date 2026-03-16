export type ProductStatus = "ACTIVE" | "SOLD_OUT" | "HIDDEN";

export interface Product {
	id: string;
	sku: string;
	name: string;
	category: string;
	unitPrice: number;
	stock: number;
	salesCount: number;
	status: ProductStatus;
	createdAt: string;
	updatedAt: string;
}
