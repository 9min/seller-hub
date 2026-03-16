import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { generateOrders } from "@/constants/dummyData";
import type { FetchOrdersParams } from "@/services/orderService";
import { fetchOrders } from "@/services/orderService";

const PAGE_SIZE = 100;
const FALLBACK_ORDERS = generateOrders(5_000);

// 모듈 레벨 — StrictMode 리마운트에도 유지됨
let dbEmpty = false;

/** @internal 테스트 전용: dbEmpty 상태 초기화 */
export function __resetDbEmpty() {
	dbEmpty = false;
}

function getFallbackPage(params: FetchOrdersParams) {
	const {
		page,
		pageSize = PAGE_SIZE,
		searchQuery,
		statuses,
		startDate,
		endDate,
		sortBy,
		sortOrder,
	} = params;

	let filtered = FALLBACK_ORDERS;

	// 텍스트 검색 필터
	if (searchQuery?.trim()) {
		const q = searchQuery.trim().toLowerCase();
		filtered = filtered.filter(
			(o) =>
				o.buyerName.toLowerCase().includes(q) ||
				o.orderNumber.toLowerCase().includes(q) ||
				o.productName.toLowerCase().includes(q),
		);
	}

	// 상태 필터
	if (statuses && statuses.length > 0) {
		filtered = filtered.filter((o) => statuses.includes(o.status));
	}

	// 기간 필터
	if (startDate) {
		filtered = filtered.filter((o) => o.orderedAt >= startDate);
	}
	if (endDate) {
		filtered = filtered.filter((o) => o.orderedAt <= `${endDate}T23:59:59.999Z`);
	}

	// 정렬
	filtered = [...filtered].sort((a, b) => {
		let aVal: string | number;
		let bVal: string | number;

		if (sortBy === "totalPrice") {
			aVal = a.totalPrice;
			bVal = b.totalPrice;
		} else if (sortBy === "quantity") {
			aVal = a.quantity;
			bVal = b.quantity;
		} else {
			// 기본: orderedAt desc
			aVal = a.orderedAt;
			bVal = b.orderedAt;
		}

		if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
		if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});

	return {
		orders: filtered.slice(page * pageSize, (page + 1) * pageSize),
		total: filtered.length,
	};
}

export function useOrdersData(params: FetchOrdersParams) {
	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["orders", params],
		queryFn: async () => {
			const { page } = params;

			// DB가 비어있다고 확인된 경우 바로 더미 데이터 반환 (네트워크 요청 없음)
			if (dbEmpty) {
				return getFallbackPage(params);
			}

			try {
				const result = await fetchOrders(params);
				// page 0에서 결과가 없을 때만 DB empty로 판단한다.
				// page 1 이상에서 빈 결과는 범위 초과(PGRST103)이므로 DB empty로 간주하지 않는다.
				if (result.total === 0 && page === 0) {
					dbEmpty = true;
					return getFallbackPage(params);
				}
				return result;
			} catch {
				// 예외도 page 0에서만 DB empty로 표시한다
				if (page === 0) {
					dbEmpty = true;
				}
				return getFallbackPage(params);
			}
		},
		placeholderData: keepPreviousData,
		// 5분간 fresh 상태 유지 — refetchOnWindowFocus에 의한 이중 호출 방지
		staleTime: 5 * 60 * 1000,
	});

	return {
		orders: data?.orders ?? [],
		total: data?.total ?? 0,
		isLoading,
		isFetching,
	};
}
