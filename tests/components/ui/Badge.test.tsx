import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
	it("텍스트를 렌더링한다", () => {
		render(<Badge variant="success">완료</Badge>);
		expect(screen.getByText("완료")).toBeInTheDocument();
	});

	it("variant에 따라 다른 스타일이 적용된다", () => {
		const { rerender } = render(<Badge variant="success">성공</Badge>);
		const el = screen.getByText("성공");
		expect(el.className).toContain("green");

		rerender(<Badge variant="error">에러</Badge>);
		expect(screen.getByText("에러").className).toContain("red");
	});

	it("default variant가 기본으로 렌더링된다", () => {
		render(<Badge variant="default">기본</Badge>);
		expect(screen.getByText("기본")).toBeInTheDocument();
	});
});
