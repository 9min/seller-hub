import { useMemo, useState } from "react";
import { generateOrders } from "@/constants/dummyData";

const ORDERS = generateOrders(50_000);

export function useOrdersData() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredOrders = useMemo(() => {
		if (!searchQuery.trim()) return ORDERS;
		const query = searchQuery.toLowerCase();
		return ORDERS.filter(
			(o) =>
				o.buyerName.toLowerCase().includes(query) ||
				o.productName.toLowerCase().includes(query) ||
				o.orderNumber.toLowerCase().includes(query),
		);
	}, [searchQuery]);

	return {
		orders: ORDERS,
		filteredOrders,
		searchQuery,
		setSearchQuery,
	};
}
