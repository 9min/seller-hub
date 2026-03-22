import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.describe("주문 관리", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
		await page.goto("/orders");
	});

	test("주문 목록이 렌더링된다", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "주문 관리" })).toBeVisible({ timeout: 10000 });
		await expect(page.getByText("주문 목록")).toBeVisible();
	});

	test("검색 입력이 URL에 반영된다", async ({ page }) => {
		const searchInput = page.getByPlaceholder("주문번호, 구매자명, 상품명 검색");
		await searchInput.fill("테스트");

		// 디바운스 대기 (300ms) + URL 인코딩 대응
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/q=/);
	});

	test("CSV 다운로드 버튼이 존재한다", async ({ page }) => {
		await expect(page.getByRole("button", { name: "CSV 다운로드" })).toBeVisible({
			timeout: 10000,
		});
	});
});
