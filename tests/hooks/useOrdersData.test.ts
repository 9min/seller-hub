import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetDbEmpty, useOrdersData } from "@/hooks/useOrdersData";
import type { FetchOrdersParams } from "@/services/orderService";
import type { OrderStatus } from "@/types/order";

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

const DEFAULT_PARAMS: FetchOrdersParams = {
	page: 0,
	pageSize: 100,
};

beforeEach(() => {
	vi.clearAllMocks();
	__resetDbEmpty();
	mockFetchOrders.mockResolvedValue({ orders: MOCK_ORDERS, total: 1 });
});

describe("useOrdersData", () => {
	it("주문 데이터를 반환한다", async () => {
		const { result } = renderHook(() => useOrdersData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		// initialData(5000)가 즉시 표시되고, queryFn 결과(1)로 교체됨
		await waitFor(() => expect(result.current.total).toBe(1));

		expect(result.current.orders.length).toBeGreaterThan(0);
	});

	it("isFetching 상태를 반환한다", () => {
		const { result } = renderHook(() => useOrdersData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		expect(typeof result.current.isFetching).toBe("boolean");
	});

	it("params를 fetchOrders에 전달한다", async () => {
		const { result } = renderHook(() => useOrdersData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));

		expect(mockFetchOrders).toHaveBeenCalledWith(expect.objectContaining(DEFAULT_PARAMS));
	});

	it("statuses 파라미터를 fetchOrders에 전달한다", async () => {
		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			statuses: ["SHIPPING", "PREPARING"],
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));

		expect(mockFetchOrders).toHaveBeenCalledWith(
			expect.objectContaining({ statuses: ["SHIPPING", "PREPARING"] }),
		);
	});

	it("startDate/endDate 파라미터를 fetchOrders에 전달한다", async () => {
		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			startDate: "2026-01-01",
			endDate: "2026-03-16",
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));

		expect(mockFetchOrders).toHaveBeenCalledWith(
			expect.objectContaining({ startDate: "2026-01-01", endDate: "2026-03-16" }),
		);
	});

	it("sortBy/sortOrder 파라미터를 fetchOrders에 전달한다", async () => {
		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			sortBy: "totalPrice",
			sortOrder: "asc",
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));

		expect(mockFetchOrders).toHaveBeenCalledWith(
			expect.objectContaining({ sortBy: "totalPrice", sortOrder: "asc" }),
		);
	});

	it("DB가 비어있으면(total=0) 더미 데이터를 반환한다", async () => {
		mockFetchOrders.mockResolvedValue({ orders: [], total: 0 });

		const { result } = renderHook(() => useOrdersData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.total).toBeGreaterThan(0); // 더미 데이터 폴백
	});

	it("DB 빈 테이블 시 statuses 필터를 더미 데이터에 적용한다", async () => {
		mockFetchOrders.mockResolvedValue({ orders: [], total: 0 });

		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			statuses: ["SHIPPING"] as OrderStatus[],
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// 반환된 주문 중 SHIPPING 상태만 존재해야 한다
		expect(result.current.orders.every((o) => o.status === "SHIPPING")).toBe(true);
	});

	it("DB 빈 테이블 시 기간 필터를 더미 데이터에 적용한다", async () => {
		mockFetchOrders.mockResolvedValue({ orders: [], total: 0 });

		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			startDate: "2099-01-01",
			endDate: "2099-12-31",
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		// 미래 날짜 범위이므로 더미 데이터에 해당 기간의 주문이 없어 total이 0이어야 한다
		expect(result.current.total).toBe(0);
	});

	it("DB 빈 테이블 시 totalPrice 내림차순 정렬을 더미 데이터에 적용한다", async () => {
		mockFetchOrders.mockResolvedValue({ orders: [], total: 0 });

		const params: FetchOrdersParams = {
			...DEFAULT_PARAMS,
			sortBy: "totalPrice",
			sortOrder: "desc",
		};

		const { result } = renderHook(() => useOrdersData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		const orders = result.current.orders;
		expect(orders.length).toBeGreaterThan(0);

		// totalPrice 내림차순 확인
		for (let i = 0; i < orders.length - 1; i++) {
			const current = orders[i];
			const next = orders[i + 1];
			if (current && next) {
				expect(current.totalPrice).toBeGreaterThanOrEqual(next.totalPrice);
			}
		}
	});
});
