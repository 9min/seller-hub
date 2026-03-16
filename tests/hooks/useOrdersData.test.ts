import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOrdersData } from "@/hooks/useOrdersData";

const MOCK_ORDERS = [
	{
		id: "order-1",
		orderNumber: "ORD-20260316-00001",
		buyerName: "김민준",
		productName: "무선 이어버드",
		category: "전자기기",
		quantity: 2,
		unitPrice: 50000,
		totalPrice: 100000,
		status: "DELIVERED" as const,
		orderedAt: "2026-03-10T00:00:00.000Z",
		shippedAt: "2026-03-12T00:00:00.000Z",
		deliveredAt: "2026-03-15T00:00:00.000Z",
		isDelayed: false,
	},
];

const mockFetchOrders = vi.fn().mockResolvedValue({ orders: MOCK_ORDERS, total: 1 });

vi.mock("@/services/orderService", () => ({
	fetchOrders: (params: unknown) => mockFetchOrders(params),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		QueryClientProvider({ client: queryClient, children });
}

beforeEach(() => {
	vi.clearAllMocks();
	mockFetchOrders.mockResolvedValue({ orders: MOCK_ORDERS, total: 1 });
});

describe("useOrdersData", () => {
	it("주문 데이터를 반환한다", async () => {
		const { result } = renderHook(() => useOrdersData(), {
			wrapper: createWrapper(),
		});

		// initialData(5000)가 즉시 표시되고, queryFn 결과(1)로 교체됨
		await waitFor(() => expect(result.current.total).toBe(1));

		expect(result.current.orders.length).toBeGreaterThan(0);
	});

	it("초기 page는 0이다", () => {
		const { result } = renderHook(() => useOrdersData(), {
			wrapper: createWrapper(),
		});

		expect(result.current.page).toBe(0);
	});

	it("setPage로 page를 변경할 수 있다", async () => {
		const { result } = renderHook(() => useOrdersData(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.setPage(2);
		});

		expect(result.current.page).toBe(2);
	});

	it("setSearchQuery로 searchQuery를 변경하면 fetchOrders가 재호출된다", async () => {
		const { result } = renderHook(() => useOrdersData(), {
			wrapper: createWrapper(),
		});

		// 초기 쿼리 완료 대기
		await waitFor(() => expect(result.current.total).toBe(1));

		act(() => {
			result.current.setSearchQuery("김민준");
		});

		await waitFor(() =>
			expect(mockFetchOrders).toHaveBeenCalledWith(
				expect.objectContaining({ searchQuery: "김민준" }),
			),
		);
	});

	it("DB가 비어있으면(total=0) 더미 데이터를 반환한다", async () => {
		mockFetchOrders.mockResolvedValue({ orders: [], total: 0 });

		const { result } = renderHook(() => useOrdersData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.total).toBeGreaterThan(0); // 더미 데이터 폴백
	});
});
