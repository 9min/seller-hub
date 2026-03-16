import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetDbEmpty, useProductsData } from "@/hooks/useProductsData";
import type { FetchProductsParams } from "@/services/productService";

const MOCK_PRODUCTS = [
	{
		id: "product-1",
		sku: "SKU-001",
		name: "무선 이어버드",
		category: "전자기기",
		unitPrice: 50000,
		stock: 100,
		salesCount: 250,
		status: "ACTIVE" as const,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-03-01T00:00:00.000Z",
	},
];

const mockFetchProducts = vi.fn().mockResolvedValue({ products: MOCK_PRODUCTS, total: 1 });

vi.mock("@/services/productService", () => ({
	fetchProducts: (params: unknown) => mockFetchProducts(params),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		QueryClientProvider({ client: queryClient, children });
}

const DEFAULT_PARAMS: FetchProductsParams = { page: 0, pageSize: 50 };

beforeEach(() => {
	vi.clearAllMocks();
	__resetDbEmpty();
	mockFetchProducts.mockResolvedValue({ products: MOCK_PRODUCTS, total: 1 });
});

describe("useProductsData", () => {
	it("상품 데이터를 반환한다", async () => {
		const { result } = renderHook(() => useProductsData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));
		expect(result.current.products[0].name).toBe("무선 이어버드");
	});

	it("fetchProducts에 params를 전달한다", async () => {
		const params: FetchProductsParams = {
			page: 0,
			pageSize: 50,
			searchQuery: "이어버드",
			categories: ["전자기기"],
		};

		const { result } = renderHook(() => useProductsData(params), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBe(1));
		expect(mockFetchProducts).toHaveBeenCalledWith(expect.objectContaining(params));
	});

	it("DB가 비어있으면 더미 데이터 폴백 반환", async () => {
		mockFetchProducts.mockResolvedValueOnce({ products: [], total: 0 });

		const { result } = renderHook(() => useProductsData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
		expect(result.current.products.length).toBeGreaterThan(0);
	});

	it("예외 발생 시 더미 데이터 폴백 반환", async () => {
		mockFetchProducts.mockRejectedValueOnce(new Error("DB error"));

		const { result } = renderHook(() => useProductsData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));
	});

	it("__resetDbEmpty 후 재시도 가능", async () => {
		mockFetchProducts.mockResolvedValueOnce({ products: [], total: 0 });

		const { result, rerender } = renderHook(() => useProductsData(DEFAULT_PARAMS), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.total).toBeGreaterThan(0));

		__resetDbEmpty();
		mockFetchProducts.mockResolvedValueOnce({ products: MOCK_PRODUCTS, total: 1 });
		rerender();

		await waitFor(() => expect(result.current.total).toBeGreaterThan(0));
	});
});
