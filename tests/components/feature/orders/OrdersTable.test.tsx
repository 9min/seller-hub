import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { generateOrders } from "@/constants/dummyData";

const mockOrders = generateOrders(100);

const defaultProps = {
	orders: mockOrders,
	total: 100,
	page: 0,
	pageSize: 100,
	searchQuery: "",
	onSearchChange: () => undefined,
	onPageChange: () => undefined,
	sortBy: "orderedAt",
	sortOrder: "desc" as const,
	onSortChange: () => undefined,
};

describe("OrdersTable", () => {
	it("테이블 헤더를 렌더링한다", () => {
		render(<OrdersTable {...defaultProps} />);
		expect(screen.getByText("주문번호")).toBeInTheDocument();
		expect(screen.getByText("구매자명")).toBeInTheDocument();
		expect(screen.getByText("상품명")).toBeInTheDocument();
		expect(screen.getByText("상태")).toBeInTheDocument();
	});

	it("검색 입력 필드를 렌더링한다", () => {
		render(<OrdersTable {...defaultProps} />);
		expect(screen.getByPlaceholderText(/검색/)).toBeInTheDocument();
	});

	it("검색어 입력 시 onSearchChange가 호출된다", () => {
		vi.useFakeTimers();
		const handleChange = vi.fn();
		render(<OrdersTable {...defaultProps} onSearchChange={handleChange} />);
		const input = screen.getByPlaceholderText(/검색/);
		fireEvent.change(input, { target: { value: "김민준" } });
		act(() => {
			vi.advanceTimersByTime(300);
		});
		expect(handleChange).toHaveBeenCalledWith("김민준");
		vi.useRealTimers();
	});

	it("주문 건수 정보를 표시한다", () => {
		render(<OrdersTable {...defaultProps} />);
		const elements = screen.getAllByText(/100건/);
		expect(elements.length).toBeGreaterThan(0);
	});

	it("페이지네이션 버튼을 렌더링한다", () => {
		render(<OrdersTable {...defaultProps} />);
		expect(screen.getByText("이전")).toBeInTheDocument();
		expect(screen.getByText("다음")).toBeInTheDocument();
	});

	it("isFetching이 true이면 '다음' 버튼이 비활성화된다", () => {
		// total=200으로 마지막 페이지가 아닌 상태 (isLast=false)지만 isFetching으로 비활성화
		render(<OrdersTable {...defaultProps} total={200} isFetching={true} />);
		expect(screen.getByText("다음")).toBeDisabled();
	});

	it("isFetching이 false이면 '다음' 버튼이 페이지 상태에 따라 활성화된다", () => {
		// total=200, page=0, pageSize=100 → lastPage=1, isLast=false → 활성화
		render(<OrdersTable {...defaultProps} total={200} isFetching={false} />);
		expect(screen.getByText("다음")).not.toBeDisabled();
	});

	it("정렬 가능한 열 헤더(주문일시, 금액, 수량)에 정렬 아이콘을 렌더링한다", () => {
		render(<OrdersTable {...defaultProps} />);

		// 정렬 가능한 헤더는 버튼 역할로 렌더링된다
		expect(screen.getByRole("button", { name: /주문일시/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /금액/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /수량/ })).toBeInTheDocument();
	});

	it("현재 정렬 중인 열(orderedAt)에 활성 아이콘이 표시된다", () => {
		render(<OrdersTable {...defaultProps} sortBy="orderedAt" sortOrder="desc" />);

		const sortButton = screen.getByRole("button", { name: /주문일시/ });
		expect(sortButton).toBeInTheDocument();
		// 활성 정렬 아이콘 포함 여부 확인 (↓)
		expect(sortButton.textContent).toContain("↓");
	});

	it("정렬 컬럼 헤더 클릭 시 onSortChange가 호출된다", () => {
		const handleSortChange = vi.fn();
		render(<OrdersTable {...defaultProps} sortBy="" onSortChange={handleSortChange} />);

		fireEvent.click(screen.getByRole("button", { name: /금액/ }));

		expect(handleSortChange).toHaveBeenCalledWith("totalPrice", "desc");
	});

	it("동일 열 재클릭 시 정렬 방향이 반전된다 (desc → asc)", () => {
		const handleSortChange = vi.fn();
		render(
			<OrdersTable
				{...defaultProps}
				sortBy="totalPrice"
				sortOrder="desc"
				onSortChange={handleSortChange}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /금액/ }));

		expect(handleSortChange).toHaveBeenCalledWith("totalPrice", "asc");
	});
});
