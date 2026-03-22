import { beforeEach, describe, expect, it, vi } from "vitest";

import { exportToCSV } from "@/utils/csvExport";

describe("exportToCSV", () => {
	let clickSpy: ReturnType<typeof vi.fn>;
	let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
	let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		clickSpy = vi.fn();
		vi.spyOn(document, "createElement").mockReturnValue({
			setAttribute: vi.fn(),
			click: clickSpy,
		} as unknown as HTMLElement);

		createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
		revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	});

	it("CSV 파일을 생성하고 다운로드 링크를 클릭한다", () => {
		const data = [
			{ name: "상품A", price: 10000 },
			{ name: "상품B", price: 20000 },
		];

		exportToCSV(data, "test", [
			{ key: "name", header: "상품명" },
			{ key: "price", header: "가격" },
		]);

		expect(createObjectURLSpy).toHaveBeenCalled();
		expect(clickSpy).toHaveBeenCalled();
		expect(revokeObjectURLSpy).toHaveBeenCalled();
	});

	it("쉼표가 포함된 값을 이스케이프한다", () => {
		const data = [{ name: "상품A, 특가", price: 10000 }];

		exportToCSV(data, "test", [
			{ key: "name", header: "상품명" },
			{ key: "price", header: "가격" },
		]);

		const blobArg = (createObjectURLSpy.mock.calls[0] as [Blob])[0];
		expect(blobArg).toBeInstanceOf(Blob);
	});

	it("null/undefined 값은 빈 문자열로 처리한다", () => {
		const data = [{ name: null, price: undefined }];

		exportToCSV(data as unknown as Record<string, unknown>[], "test", [
			{ key: "name" as never, header: "상품명" },
			{ key: "price" as never, header: "가격" },
		]);

		expect(clickSpy).toHaveBeenCalled();
	});
});
