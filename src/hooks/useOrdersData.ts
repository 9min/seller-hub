import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { generateOrders } from "@/constants/dummyData";
import { fetchOrders } from "@/services/orderService";

const PAGE_SIZE = 100;
const FALLBACK_ORDERS = generateOrders(5_000);

// 모듈 레벨 — StrictMode 리마운트에도 유지됨
let dbEmpty = false;

/** @internal 테스트 전용: dbEmpty 상태 초기화 */
export function __resetDbEmpty() {
	dbEmpty = false;
}

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

	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["orders", page, searchQuery],
		queryFn: async () => {
			// DB가 비어있다고 확인된 경우 바로 더미 데이터 반환 (네트워크 요청 없음)
			if (dbEmpty) {
				return getFallbackPage(page, searchQuery);
			}

			try {
				const result = await fetchOrders({ page, pageSize: PAGE_SIZE, searchQuery });
				// page 0에서 결과가 없을 때만 DB empty로 판단한다.
				// page 1 이상에서 빈 결과는 범위 초과(PGRST103)이므로 DB empty로 간주하지 않는다.
				if (result.total === 0 && page === 0) {
					dbEmpty = true;
					return getFallbackPage(page, searchQuery);
				}
				return result;
			} catch {
				// 예외도 page 0에서만 DB empty로 표시한다
				if (page === 0) {
					dbEmpty = true;
				}
				return getFallbackPage(page, searchQuery);
			}
		},
		placeholderData: keepPreviousData,
		// 5분간 fresh 상태 유지 — refetchOnWindowFocus에 의한 이중 호출 방지
		staleTime: 5 * 60 * 1000,
	});

	return {
		orders: data?.orders ?? [],
		total: data?.total ?? 0,
		page,
		setPage,
		searchQuery,
		setSearchQuery,
		isLoading,
		isFetching,
	};
}
