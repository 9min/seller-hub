export type OrderStatus =
	| "PAYMENT_COMPLETE"
	| "PREPARING"
	| "SHIPPING"
	| "DELIVERED"
	| "RETURN_REQUESTED"
	| "EXCHANGE_REQUESTED"
	| "CANCELLED";

export interface Order {
	id: string;
	orderNumber: string;
	buyerName: string;
	productId: string | null;
	productName: string;
	category: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	status: OrderStatus;
	orderedAt: string;
	shippedAt: string | null;
	deliveredAt: string | null;
	isDelayed: boolean;
}
