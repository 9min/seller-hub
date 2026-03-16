import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "@/components/feature/dashboard/KpiCard";
import type { KpiMetric } from "@/types/kpi";

const mockMetric: KpiMetric = {
	id: "total_revenue",
	label: "총 매출",
	value: 142500000,
	formattedValue: "₩142,500,000",
	changeRate: 12.3,
	trend: "up",
	unit: "원",
	description: "전월 대비 +12.3%",
};

describe("KpiCard", () => {
	it("레이블과 값을 렌더링한다", () => {
		render(<KpiCard metric={mockMetric} />);
		expect(screen.getByText("총 매출")).toBeInTheDocument();
		expect(screen.getByText("₩142,500,000")).toBeInTheDocument();
	});

	it("변화율 설명을 렌더링한다", () => {
		render(<KpiCard metric={mockMetric} />);
		// 텍스트가 여러 노드로 나뉠 수 있으므로 정규식 사용
		expect(screen.getByText(/전월 대비/)).toBeInTheDocument();
	});

	it("trend가 up이면 상승 표시를 렌더링한다", () => {
		render(<KpiCard metric={mockMetric} />);
		const descEl = screen.getByText(/전월 대비/);
		expect(descEl.closest("p")?.className).toContain("green");
	});
});
