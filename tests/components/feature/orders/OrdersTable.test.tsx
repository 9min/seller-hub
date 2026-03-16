import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrdersTable } from "@/components/feature/orders/OrdersTable";
import { generateOrders } from "@/constants/dummyData";

const mockOrders = generateOrders(100);

describe("OrdersTable", () => {
	it("테이블 헤더를 렌더링한다", () => {
		render(<OrdersTable orders={mockOrders} searchQuery="" onSearchChange={() => undefined} />);
		expect(screen.getByText("주문번호")).toBeInTheDocument();
		expect(screen.getByText("구매자명")).toBeInTheDocument();
		expect(screen.getByText("상품명")).toBeInTheDocument();
		expect(screen.getByText("상태")).toBeInTheDocument();
	});

	it("검색 입력 필드를 렌더링한다", () => {
		render(<OrdersTable orders={mockOrders} searchQuery="" onSearchChange={() => undefined} />);
		expect(screen.getByPlaceholderText(/검색/)).toBeInTheDocument();
	});

	it("검색어 입력 시 onSearchChange가 호출된다", () => {
		const handleChange = vi.fn();
		render(<OrdersTable orders={mockOrders} searchQuery="" onSearchChange={handleChange} />);
		const input = screen.getByPlaceholderText(/검색/);
		fireEvent.change(input, { target: { value: "김민준" } });
		expect(handleChange).toHaveBeenCalledWith("김민준");
	});

	it("주문 건수 정보를 표시한다", () => {
		render(<OrdersTable orders={mockOrders} searchQuery="" onSearchChange={() => undefined} />);
		expect(screen.getByText(/100/)).toBeInTheDocument();
	});
});
