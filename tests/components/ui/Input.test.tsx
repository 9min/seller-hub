import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/Input";

describe("Input", () => {
	it("label과 함께 렌더링된다", () => {
		render(<Input id="test" label="이메일" />);

		expect(screen.getByLabelText("이메일")).toBeInTheDocument();
	});

	it("label 없이도 렌더링된다", () => {
		render(<Input id="test" placeholder="입력" />);

		expect(screen.getByPlaceholderText("입력")).toBeInTheDocument();
	});

	it("에러 메시지를 표시한다", () => {
		render(<Input id="test" error="필수 항목입니다" />);

		expect(screen.getByRole("alert")).toHaveTextContent("필수 항목입니다");
	});

	it("에러 시 aria-invalid가 true이다", () => {
		render(<Input id="test" error="에러" />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("aria-invalid", "true");
	});

	it("에러가 없으면 aria-invalid가 false이다", () => {
		render(<Input id="test" />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("aria-invalid", "false");
	});

	it("disabled 상태가 적용된다", () => {
		render(<Input id="test" disabled />);

		expect(screen.getByRole("textbox")).toBeDisabled();
	});
});
