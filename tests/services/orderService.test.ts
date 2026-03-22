import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchCategoryData,
	fetchKpiMetrics,
	fetchOrders,
	fetchSalesData,
} from "@/services/orderService";

// ──────────────────────────────────────────────
// vi.hoisted 로 mock 함수 선언 (vi.mock 호이스팅보다 먼저 실행됨)
// ──────────────────────────────────────────────
const { mockRpc, mockFrom, mockQueryBuilder, getOrdersResult, setOrdersResult } = vi.hoisted(() => {
	let _result: { data: unknown; error: unknown; count?: number } = {
		data: [],
		error: null,
		count: 0,
	};

	const builder = {
		select: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		range: vi.fn().mockReturnThis(),
		or: vi.fn().mockReturnThis(),
		in: vi.fn().mockReturnThis(),
		gte: vi.fn().mockReturnThis(),
		lte: vi.fn().mockReturnThis(),
		// thenable: await query 를 지원 (biome 의도적 우회)
		// biome-ignore lint/suspicious/noThenProperty: mock 테이블 빌더에서 thenable 패턴 필요
		then(
			onfulfilled?: (value: typeof _result) => unknown,
			onrejected?: (reason: unknown) => unknown,
		) {
			return Promise.resolve(_result).then(onfulfilled, onrejected);
		},
		catch(onrejected?: (reason: unknown) => unknown) {
			return Promise.resolve(_result).catch(onrejected);
		},
	};

	return {
		mockRpc: vi.fn(),
		mockFrom: vi.fn().mockReturnValue(builder),
		mockQueryBuilder: builder,
		getOrdersResult: () => _result,
		setOrdersResult: (r: typeof _result) => {
			_result = r;
		},
	};
});

vi.mock("@/lib/supabase", () => ({
	supabase: {
		rpc: mockRpc,
		from: mockFrom,
	},
}));

// ──────────────────────────────────────────────
// 테스트 데이터
// ──────────────────────────────────────────────
const MOCK_ORDER_ROWS = [
	{
		id: "order-1",
		order_number: "ORD-20260316-00001",
		buyer_name: "김민준",
		product_id: "product-1",
		products: { name: "무선 이어버드", category: "전자기기" },
		quantity: 2,
		unit_price: 50000,
		total_price: 100000,
		status: "DELIVERED",
		ordered_at: "2026-03-10T00:00:00.000Z",
		shipped_at: "2026-03-12T00:00:00.000Z",
		delivered_at: "2026-03-15T00:00:00.000Z",
		is_delayed: false,
		created_at: "2026-03-10T00:00:00.000Z",
		updated_at: "2026-03-10T00:00:00.000Z",
		created_by: null,
		updated_by: null,
		deleted_at: null,
		seller_id: null,
	},
	{
		id: "order-2",
		order_number: "ORD-20260315-00002",
		buyer_name: "이서연",
		product_id: "product-2",
		products: { name: "수분 크림", category: "뷰티" },
		quantity: 1,
		unit_price: 30000,
		total_price: 30000,
		status: "SHIPPING",
		ordered_at: "2026-03-09T00:00:00.000Z",
		shipped_at: "2026-03-11T00:00:00.000Z",
		delivered_at: null,
		is_delayed: true,
		created_at: "2026-03-09T00:00:00.000Z",
		updated_at: "2026-03-09T00:00:00.000Z",
		created_by: null,
		updated_by: null,
		deleted_at: null,
		seller_id: null,
	},
];

const MOCK_KPI_ROWS = [
	{ id: "total_revenue", label: "총 매출", value: 1234567890, changeRate: 12.3, unit: "원" },
	{ id: "new_orders", label: "신규 주문", value: 542, changeRate: 8.1, unit: "건" },
	{ id: "delayed", label: "배송 지연", value: 37, changeRate: -3.2, unit: "건" },
	{ id: "return_rate", label: "반품/교환율", value: 4.5, changeRate: 0.5, unit: "%" },
];

const MOCK_SALES_ROWS = [
	{ label: "3/1", revenue: 5000000 },
	{ label: "3/2", revenue: 7000000 },
	{ label: "3/3", revenue: 4500000 },
];

const MOCK_CATEGORY_ROWS = [
	{ name: "전자기기", value: 12000 },
	{ name: "패션의류", value: 9800 },
	{ name: "뷰티", value: 7200 },
];

// ──────────────────────────────────────────────
// 각 테스트 전 초기화
// ──────────────────────────────────────────────
beforeEach(() => {
	vi.clearAllMocks();
	mockFrom.mockReturnValue(mockQueryBuilder);
	mockQueryBuilder.select.mockReturnThis();
	mockQueryBuilder.order.mockReturnThis();
	mockQueryBuilder.range.mockReturnThis();
	mockQueryBuilder.or.mockReturnThis();
	mockQueryBuilder.in.mockReturnThis();
	mockQueryBuilder.gte.mockReturnThis();
	mockQueryBuilder.lte.mockReturnThis();
	setOrdersResult({ data: [], error: null, count: 0 });
});

// suppress unused-import warning
void getOrdersResult;

// ──────────────────────────────────────────────
// fetchOrders
// ──────────────────────────────────────────────
describe("fetchOrders", () => {
	it("orders 배열과 total count를 반환한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		const result = await fetchOrders({ page: 0, pageSize: 100 });

		expect(result.orders).toHaveLength(2);
		expect(result.total).toBe(2);
	});

	it("DB 행을 camelCase Order 도메인 타입으로 변환한다", async () => {
		setOrdersResult({ data: [MOCK_ORDER_ROWS[0]], error: null, count: 1 });

		const result = await fetchOrders({ page: 0, pageSize: 100 });
		const order = result.orders[0];

		expect(order).toBeDefined();
		expect(order?.orderNumber).toBe("ORD-20260316-00001");
		expect(order?.buyerName).toBe("김민준");
		expect(order?.productId).toBe("product-1");
		expect(order?.productName).toBe("무선 이어버드");
		expect(order?.category).toBe("전자기기");
		expect(order?.isDelayed).toBe(false);
	});

	it("searchQuery가 있으면 or 필터를 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, searchQuery: "김민준" });

		expect(mockQueryBuilder.or).toHaveBeenCalledWith(expect.stringContaining("김민준"));
	});

	it("searchQuery가 없으면 or 필터를 적용하지 않는다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100 });

		expect(mockQueryBuilder.or).not.toHaveBeenCalled();
	});

	it("page에 따라 range offset을 계산한다", async () => {
		setOrdersResult({ data: [], error: null, count: 0 });

		await fetchOrders({ page: 2, pageSize: 100 });

		// page=2, pageSize=100 → range(200, 299)
		expect(mockQueryBuilder.range).toHaveBeenCalledWith(200, 299);
	});

	it("에러 발생 시 예외를 던진다", async () => {
		setOrdersResult({ data: null, error: new Error("DB 오류"), count: 0 });

		await expect(fetchOrders({ page: 0, pageSize: 100 })).rejects.toThrow("DB 오류");
	});

	it("PGRST103 에러 발생 시 빈 배열과 total 0을 반환하고 예외를 던지지 않는다", async () => {
		// Arrange: Supabase range 초과 에러 (page가 데이터 범위를 벗어날 때 발생)
		setOrdersResult({
			data: null,
			error: {
				code: "PGRST103",
				message: "An offset of 100 was requested, but there are only 0 rows.",
			},
			count: 0,
		});

		// Act
		const result = await fetchOrders({ page: 1, pageSize: 100 });

		// Assert: 예외 없이 빈 결과 반환
		expect(result).toEqual({ orders: [], total: 0 });
	});

	it("statuses 배열이 있으면 .in() 필터를 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, statuses: ["SHIPPING", "DELIVERED"] });

		expect(mockQueryBuilder.in).toHaveBeenCalledWith("status", ["SHIPPING", "DELIVERED"]);
	});

	it("statuses가 빈 배열이면 .in() 필터를 적용하지 않는다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, statuses: [] });

		expect(mockQueryBuilder.in).not.toHaveBeenCalled();
	});

	it("startDate가 있으면 .gte() 필터를 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, startDate: "2026-01-01" });

		expect(mockQueryBuilder.gte).toHaveBeenCalledWith("ordered_at", "2026-01-01");
	});

	it("endDate가 있으면 당일 23:59:59.999Z를 포함하여 .lte() 필터를 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, endDate: "2026-03-16" });

		expect(mockQueryBuilder.lte).toHaveBeenCalledWith("ordered_at", "2026-03-16T23:59:59.999Z");
	});

	it("sortBy/sortOrder가 있으면 해당 컬럼으로 .order()를 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100, sortBy: "totalPrice", sortOrder: "asc" });

		expect(mockQueryBuilder.order).toHaveBeenCalledWith("total_price", { ascending: true });
	});

	it("sortBy가 없으면 ordered_at desc로 정렬한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({ page: 0, pageSize: 100 });

		expect(mockQueryBuilder.order).toHaveBeenCalledWith("ordered_at", { ascending: false });
	});

	it("모든 파라미터를 동시에 적용한다", async () => {
		setOrdersResult({ data: MOCK_ORDER_ROWS, error: null, count: 2 });

		await fetchOrders({
			page: 0,
			pageSize: 100,
			searchQuery: "김민준",
			statuses: ["SHIPPING"],
			startDate: "2026-01-01",
			endDate: "2026-03-16",
			sortBy: "orderedAt",
			sortOrder: "desc",
		});

		expect(mockQueryBuilder.or).toHaveBeenCalled();
		expect(mockQueryBuilder.in).toHaveBeenCalledWith("status", ["SHIPPING"]);
		expect(mockQueryBuilder.gte).toHaveBeenCalledWith("ordered_at", "2026-01-01");
		expect(mockQueryBuilder.lte).toHaveBeenCalledWith("ordered_at", "2026-03-16T23:59:59.999Z");
		expect(mockQueryBuilder.order).toHaveBeenCalledWith("ordered_at", { ascending: false });
	});
});

// ──────────────────────────────────────────────
// fetchKpiMetrics
// ──────────────────────────────────────────────
describe("fetchKpiMetrics", () => {
	it("KpiMetric[] 4개를 반환한다", async () => {
		mockRpc.mockResolvedValue({ data: MOCK_KPI_ROWS, error: null });

		const result = await fetchKpiMetrics();

		expect(result).toHaveLength(4);
	});

	it("각 KpiMetric에 필수 필드가 존재한다", async () => {
		mockRpc.mockResolvedValue({ data: MOCK_KPI_ROWS, error: null });

		const result = await fetchKpiMetrics();
		const kpi = result[0];

		expect(kpi).toBeDefined();
		expect(kpi?.id).toBe("total_revenue");
		expect(kpi?.label).toBe("총 매출");
		expect(typeof kpi?.formattedValue).toBe("string");
		expect(typeof kpi?.description).toBe("string");
		expect(["up", "down", "neutral"]).toContain(kpi?.trend);
	});

	it("changeRate > 0 이면 trend가 up이다", async () => {
		mockRpc.mockResolvedValue({
			data: [{ id: "new_orders", label: "신규 주문", value: 100, changeRate: 5.0, unit: "건" }],
			error: null,
		});

		const [result] = await fetchKpiMetrics();
		expect(result?.trend).toBe("up");
	});

	it("changeRate < 0 이면 trend가 down이다", async () => {
		mockRpc.mockResolvedValue({
			data: [{ id: "delayed", label: "배송 지연", value: 10, changeRate: -2.0, unit: "건" }],
			error: null,
		});

		const [result] = await fetchKpiMetrics();
		expect(result?.trend).toBe("down");
	});

	it("에러 발생 시 예외를 던진다", async () => {
		mockRpc.mockResolvedValue({ data: null, error: new Error("RPC 오류") });

		await expect(fetchKpiMetrics()).rejects.toThrow("RPC 오류");
	});
});

// ──────────────────────────────────────────────
// fetchSalesData
// ──────────────────────────────────────────────
describe("fetchSalesData", () => {
	it("SalesDataPoint[] 를 반환한다", async () => {
		mockRpc.mockResolvedValue({ data: MOCK_SALES_ROWS, error: null });

		const result = await fetchSalesData("daily");

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ label: "3/1", revenue: 5000000 });
	});

	it("p_period 인자로 period를 전달한다", async () => {
		mockRpc.mockResolvedValue({ data: MOCK_SALES_ROWS, error: null });

		await fetchSalesData("monthly");

		expect(mockRpc).toHaveBeenCalledWith("get_sales_data", { p_period: "monthly" });
	});

	it("에러 발생 시 예외를 던진다", async () => {
		mockRpc.mockResolvedValue({ data: null, error: new Error("RPC 오류") });

		await expect(fetchSalesData("daily")).rejects.toThrow("RPC 오류");
	});
});

// ──────────────────────────────────────────────
// fetchCategoryData
// ──────────────────────────────────────────────
describe("fetchCategoryData", () => {
	it("CategoryDataPoint[] 를 반환한다 (color 필드 포함)", async () => {
		mockRpc.mockResolvedValue({ data: MOCK_CATEGORY_ROWS, error: null });

		const result = await fetchCategoryData();

		expect(result).toHaveLength(3);
		expect(result[0]).toMatchObject({ name: "전자기기", value: 12000 });
		expect(typeof result[0]?.color).toBe("string");
	});

	it("CATEGORY_COLORS 상수에 따라 color가 매핑된다", async () => {
		mockRpc.mockResolvedValue({
			data: [{ name: "전자기기", value: 100 }],
			error: null,
		});

		const [result] = await fetchCategoryData();

		expect(result?.color).toBe("#7c3aed");
	});

	it("미등록 카테고리는 DEFAULT_CATEGORY_COLOR를 사용한다", async () => {
		mockRpc.mockResolvedValue({
			data: [{ name: "기타", value: 50 }],
			error: null,
		});

		const [result] = await fetchCategoryData();

		expect(result?.color).toBe("#2563eb");
	});

	it("에러 발생 시 예외를 던진다", async () => {
		mockRpc.mockResolvedValue({ data: null, error: new Error("RPC 오류") });

		await expect(fetchCategoryData()).rejects.toThrow("RPC 오류");
	});
});
