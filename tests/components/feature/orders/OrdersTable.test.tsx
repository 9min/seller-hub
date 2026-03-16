import { fireEvent, render, screen } from "@testing-library/react";
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
		const handleChange = vi.fn();
		render(<OrdersTable {...defaultProps} onSearchChange={handleChange} />);
		const input = screen.getByPlaceholderText(/검색/);
		fireEvent.change(input, { target: { value: "김민준" } });
		expect(handleChange).toHaveBeenCalledWith("김민준");
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
});
