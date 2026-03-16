import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrdersFilterBar } from "@/components/feature/orders/OrdersFilterBar";
import { ORDER_STATUS_LABEL } from "@/constants/orderStatus";
import type { OrderStatus } from "@/types/order";

const defaultProps = {
	statuses: [] as OrderStatus[],
	startDate: "",
	endDate: "",
	onStatusesChange: vi.fn(),
	onStartDateChange: vi.fn(),
	onEndDateChange: vi.fn(),
	onReset: vi.fn(),
};

describe("OrdersFilterBar", () => {
	it("7개 주문 상태 체크박스를 렌더링한다", () => {
		render(<OrdersFilterBar {...defaultProps} />);

		const statusKeys = Object.keys(ORDER_STATUS_LABEL);
		expect(statusKeys).toHaveLength(7);

		for (const label of Object.values(ORDER_STATUS_LABEL)) {
			expect(screen.getByLabelText(label)).toBeInTheDocument();
		}
	});

	it("체크박스 클릭 시 onStatusesChange가 추가 상태로 호출된다", () => {
		const handleStatusesChange = vi.fn();
		render(
			<OrdersFilterBar {...defaultProps} statuses={[]} onStatusesChange={handleStatusesChange} />,
		);

		fireEvent.click(screen.getByLabelText("배송중"));

		expect(handleStatusesChange).toHaveBeenCalledWith(["SHIPPING"]);
	});

	it("이미 선택된 상태 체크박스 클릭 시 onStatusesChange가 제거 상태로 호출된다", () => {
		const handleStatusesChange = vi.fn();
		render(
			<OrdersFilterBar
				{...defaultProps}
				statuses={["SHIPPING", "DELIVERED"] as OrderStatus[]}
				onStatusesChange={handleStatusesChange}
			/>,
		);

		fireEvent.click(screen.getByLabelText("배송중"));

		expect(handleStatusesChange).toHaveBeenCalledWith(["DELIVERED"]);
	});

	it("시작일 변경 시 onStartDateChange 콜백이 호출된다", () => {
		const handleStartDateChange = vi.fn();
		render(<OrdersFilterBar {...defaultProps} onStartDateChange={handleStartDateChange} />);

		const startDateInput = screen.getByLabelText("시작일");
		fireEvent.change(startDateInput, { target: { value: "2026-01-01" } });

		expect(handleStartDateChange).toHaveBeenCalledWith("2026-01-01");
	});

	it("종료일 변경 시 onEndDateChange 콜백이 호출된다", () => {
		const handleEndDateChange = vi.fn();
		render(<OrdersFilterBar {...defaultProps} onEndDateChange={handleEndDateChange} />);

		const endDateInput = screen.getByLabelText("종료일");
		fireEvent.change(endDateInput, { target: { value: "2026-03-16" } });

		expect(handleEndDateChange).toHaveBeenCalledWith("2026-03-16");
	});

	it("초기화 버튼 클릭 시 onReset 콜백이 호출된다", () => {
		const handleReset = vi.fn();
		render(
			<OrdersFilterBar
				{...defaultProps}
				statuses={["SHIPPING"] as OrderStatus[]}
				onReset={handleReset}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "초기화" }));

		expect(handleReset).toHaveBeenCalledTimes(1);
	});

	it("필터가 없을 때 초기화 버튼이 비활성화된다", () => {
		render(<OrdersFilterBar {...defaultProps} />);

		expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled();
	});

	it("statuses 필터가 있을 때 초기화 버튼이 활성화된다", () => {
		render(<OrdersFilterBar {...defaultProps} statuses={["SHIPPING"] as OrderStatus[]} />);

		expect(screen.getByRole("button", { name: "초기화" })).not.toBeDisabled();
	});

	it("startDate 필터가 있을 때 초기화 버튼이 활성화된다", () => {
		render(<OrdersFilterBar {...defaultProps} startDate="2026-01-01" />);

		expect(screen.getByRole("button", { name: "초기화" })).not.toBeDisabled();
	});
});
