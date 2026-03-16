import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { generateOrders } from "@/constants/dummyData";
import { fetchOrders } from "@/services/orderService";

const PAGE_SIZE = 100;
const FALLBACK_ORDERS = generateOrders(5_000);

function getFallbackPage(page: number, searchQuery: string) {
	const q = searchQuery.trim().toLowerCase();
	const filtered = q
		? FALLBACK_ORDERS.filter(
				(o) =>
					o.buyerName.toLowerCase().includes(q) ||
					o.orderNumber.toLowerCase().includes(q) ||
					o.productName.toLowerCase().includes(q),
			)
		: FALLBACK_ORDERS;

	return {
		orders: filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
		total: filtered.length,
	};
}

export function useOrdersData() {
	const [page, setPage] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");

	// DB가 비어있음이 확인되면 이후 요청을 건너뜀
	const dbEmpty = useRef(false);

	const { data, isLoading } = useQuery({
		queryKey: ["orders", page, searchQuery],
		queryFn: async () => {
			// DB가 비어있다고 확인된 경우 바로 더미 데이터 반환 (네트워크 요청 없음)
			if (dbEmpty.current) {
				return getFallbackPage(page, searchQuery);
			}

			try {
				const result = await fetchOrders({ page, pageSize: PAGE_SIZE, searchQuery });
				if (result.total === 0) {
					dbEmpty.current = true;
					return getFallbackPage(page, searchQuery);
				}
				return result;
			} catch {
				dbEmpty.current = true;
				return getFallbackPage(page, searchQuery);
			}
		},
		placeholderData: keepPreviousData,
		initialData: () => getFallbackPage(0, ""),
		initialDataUpdatedAt: 0,
	});

	return {
		orders: data?.orders ?? [],
		total: data?.total ?? 0,
		page,
		setPage,
		searchQuery,
		setSearchQuery,
		isLoading,
	};
}
