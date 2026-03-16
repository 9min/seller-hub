import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProductsFilterBar } from "@/components/feature/products/ProductsFilterBar";

describe("ProductsFilterBar", () => {
	it("카테고리 체크박스 토글", async () => {
		const onCategoriesChange = vi.fn();

		render(
			<ProductsFilterBar
				categories={[]}
				statuses={[]}
				onCategoriesChange={onCategoriesChange}
				onStatusesChange={vi.fn()}
				onReset={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByLabelText("전자기기"));
		expect(onCategoriesChange).toHaveBeenCalledWith(["전자기기"]);
	});

	it("이미 선택된 카테고리 해제", async () => {
		const onCategoriesChange = vi.fn();

		render(
			<ProductsFilterBar
				categories={["전자기기"]}
				statuses={[]}
				onCategoriesChange={onCategoriesChange}
				onStatusesChange={vi.fn()}
				onReset={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByLabelText("전자기기"));
		expect(onCategoriesChange).toHaveBeenCalledWith([]);
	});

	it("상태 체크박스 토글", async () => {
		const onStatusesChange = vi.fn();

		render(
			<ProductsFilterBar
				categories={[]}
				statuses={[]}
				onCategoriesChange={vi.fn()}
				onStatusesChange={onStatusesChange}
				onReset={vi.fn()}
			/>,
		);

		await userEvent.click(screen.getByLabelText("판매중"));
		expect(onStatusesChange).toHaveBeenCalledWith(["ACTIVE"]);
	});

	it("필터 없으면 초기화 버튼 비활성화", () => {
		render(
			<ProductsFilterBar
				categories={[]}
				statuses={[]}
				onCategoriesChange={vi.fn()}
				onStatusesChange={vi.fn()}
				onReset={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled();
	});

	it("필터 있으면 초기화 버튼 활성화 및 클릭", async () => {
		const onReset = vi.fn();

		render(
			<ProductsFilterBar
				categories={["전자기기"]}
				statuses={[]}
				onCategoriesChange={vi.fn()}
				onStatusesChange={vi.fn()}
				onReset={onReset}
			/>,
		);

		const resetBtn = screen.getByRole("button", { name: "초기화" });
		expect(resetBtn).not.toBeDisabled();
		await userEvent.click(resetBtn);
		expect(onReset).toHaveBeenCalled();
	});
});
