import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
	it("children을 렌더링한다", () => {
		render(<Card>카드 내용</Card>);
		expect(screen.getByText("카드 내용")).toBeInTheDocument();
	});

	it("추가 className을 병합한다", () => {
		render(<Card className="custom-class">내용</Card>);
		expect(screen.getByText("내용").closest("div")?.className).toContain("custom-class");
	});
});
