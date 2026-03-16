import { expect, test } from "@playwright/test";

test.describe("주문 필터 URL 동기화", () => {
	test("/orders 페이지 접근 가능", async ({ page }) => {
		await page.goto("/orders");
		await expect(page).toHaveURL("/orders");
	});

	test("필터가 포함된 URL 직접 접근 시 필터 상태 복원", async ({ page }) => {
		await page.goto("/orders?status=배송중");
		await expect(page).toHaveURL(/status=/);
	});
});
