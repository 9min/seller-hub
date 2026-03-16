import { expect, test } from "@playwright/test";

test.describe("페이지 접근", () => {
	test("/ 접근 시 대시보드 렌더링", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL("/");
		await expect(page.locator("text=대시보드")).toBeVisible({ timeout: 10000 });
	});

	test("/orders 접근 시 주문 관리 렌더링", async ({ page }) => {
		await page.goto("/orders");
		await expect(page).toHaveURL("/orders");
	});

	test("/products 접근 시 상품 관리 렌더링", async ({ page }) => {
		await page.goto("/products");
		await expect(page).toHaveURL("/products");
	});

	test("/analytics 접근 시 매출 분석 렌더링", async ({ page }) => {
		await page.goto("/analytics");
		await expect(page).toHaveURL("/analytics");
	});
});
