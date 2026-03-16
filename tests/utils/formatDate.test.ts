import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "@/utils/formatDate";

describe("formatDate", () => {
	it("ISO 날짜 문자열을 YYYY-MM-DD 형식으로 포매팅한다", () => {
		expect(formatDate("2024-03-15T10:30:00.000Z")).toMatch(/2024-03-1[45]/);
	});

	it("null을 빈 문자열로 반환한다", () => {
		expect(formatDate(null)).toBe("-");
	});
});

describe("formatDateTime", () => {
	it("날짜와 시간을 함께 포매팅한다", () => {
		const result = formatDateTime("2024-03-15T10:30:00.000Z");
		expect(result).toMatch(/2024-03-1[45]/);
	});

	it("null을 하이픈으로 반환한다", () => {
		expect(formatDateTime(null)).toBe("-");
	});
});
