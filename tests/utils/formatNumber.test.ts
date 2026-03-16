import { describe, expect, it } from "vitest";
import { formatCount, formatCurrency, formatPercent } from "@/utils/formatNumber";

describe("formatCurrency", () => {
	it("숫자를 원화 형식으로 포매팅한다", () => {
		expect(formatCurrency(1000000)).toBe("₩1,000,000");
	});

	it("0원을 올바르게 포매팅한다", () => {
		expect(formatCurrency(0)).toBe("₩0");
	});

	it("소수점 없이 정수로 표시한다", () => {
		expect(formatCurrency(142500000)).toBe("₩142,500,000");
	});
});

describe("formatPercent", () => {
	it("소수점 1자리 퍼센트로 포매팅한다", () => {
		expect(formatPercent(12.3)).toBe("12.3%");
	});

	it("0%를 올바르게 포매팅한다", () => {
		expect(formatPercent(0)).toBe("0.0%");
	});

	it("음수 퍼센트를 포매팅한다", () => {
		expect(formatPercent(-5.5)).toBe("-5.5%");
	});
});

describe("formatCount", () => {
	it("천 단위 구분자를 포함해 포매팅한다", () => {
		expect(formatCount(12345)).toBe("12,345");
	});

	it("0건을 올바르게 포매팅한다", () => {
		expect(formatCount(0)).toBe("0");
	});
});
