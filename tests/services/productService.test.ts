import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductStatus } from "@/types/product";

// Supabase mock
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockIlike = vi.fn();
const mockIn = vi.fn();

const mockQueryChain = {
	select: mockSelect,
	order: mockOrder,
	range: mockRange,
	ilike: mockIlike,
	in: mockIn,
	or: vi.fn(),
};

// 체이닝 설정
mockSelect.mockReturnValue(mockQueryChain);
mockOrder.mockReturnValue(mockQueryChain);
mockRange.mockReturnValue(mockQueryChain);
mockIlike.mockReturnValue(mockQueryChain);
mockIn.mockReturnValue(mockQueryChain);
mockQueryChain.or.mockReturnValue(mockQueryChain);

const mockFrom = vi.fn(() => mockQueryChain);

vi.mock("@/lib/supabase", () => ({
	supabase: { from: mockFrom },
}));

beforeEach(() => {
	vi.clearAllMocks();
	mockSelect.mockReturnValue(mockQueryChain);
	mockOrder.mockReturnValue(mockQueryChain);
	mockRange.mockReturnValue(mockQueryChain);
	mockIlike.mockReturnValue(mockQueryChain);
	mockIn.mockReturnValue(mockQueryChain);
	mockQueryChain.or.mockReturnValue(mockQueryChain);
	mockFrom.mockReturnValue(mockQueryChain);
});

const MOCK_DB_ROW = {
	id: "product-1",
	sku: "SKU-001",
	name: "무선 이어버드",
	category: "전자기기",
	unit_price: 50000,
	stock: 100,
	sales_count: 250,
	status: "ACTIVE",
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-03-01T00:00:00.000Z",
	created_by: null,
	updated_by: null,
	deleted_at: null,
};

describe("fetchProducts", () => {
	it("기본 목록 조회 시 products 테이블에서 데이터 반환", async () => {
		mockRange.mockResolvedValueOnce({ data: [MOCK_DB_ROW], error: null, count: 1 });

		const { fetchProducts } = await import("@/services/productService");
		const result = await fetchProducts({ page: 0, pageSize: 50 });

		expect(mockFrom).toHaveBeenCalledWith("products");
		expect(result.total).toBe(1);
		expect(result.products[0]).toMatchObject({
			id: "product-1",
			sku: "SKU-001",
			name: "무선 이어버드",
			category: "전자기기",
			unitPrice: 50000,
			stock: 100,
			salesCount: 250,
			status: "ACTIVE",
		});
	});

	it("검색어 적용 시 name.ilike 필터 호출", async () => {
		mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

		const { fetchProducts } = await import("@/services/productService");
		await fetchProducts({ page: 0, pageSize: 50, searchQuery: "이어버드" });

		expect(mockQueryChain.or).toHaveBeenCalledWith(expect.stringContaining("이어버드"));
	});

	it("카테고리 필터 적용 시 .in('category') 호출", async () => {
		mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });

		const { fetchProducts } = await import("@/services/productService");
		await fetchProducts({ page: 0, pageSize: 50, categories: ["전자기기", "뷰티"] });

		expect(mockQueryChain.in).toHaveBeenCalledWith("category", ["전자기기", "뷰티"]);
	});

	it("상태 필터 적용 시 .in('status') 호출", async () => {
		mockRange.mockResolvedValueOnce({ data: [], error: null, count: 0 });
		const statuses: ProductStatus[] = ["ACTIVE", "SOLD_OUT"];

		const { fetchProducts } = await import("@/services/productService");
		await fetchProducts({ page: 0, pageSize: 50, statuses });

		expect(mockQueryChain.in).toHaveBeenCalledWith("status", statuses);
	});

	it("PGRST103 에러 시 빈 배열과 total 0 반환", async () => {
		mockRange.mockResolvedValueOnce({
			data: null,
			error: { code: "PGRST103", message: "Range Not Satisfiable" },
			count: null,
		});

		const { fetchProducts } = await import("@/services/productService");
		const result = await fetchProducts({ page: 999, pageSize: 50 });

		expect(result).toEqual({ products: [], total: 0 });
	});

	it("일반 에러 시 throw", async () => {
		mockRange.mockResolvedValueOnce({
			data: null,
			error: { code: "PGRST000", message: "DB error" },
			count: null,
		});

		const { fetchProducts } = await import("@/services/productService");
		await expect(fetchProducts({ page: 0, pageSize: 50 })).rejects.toBeTruthy();
	});
});
