import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.describe("상품 관리", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
		await page.goto("/products");
	});

	test("상품 목록이 렌더링된다", async ({ page }) => {
		await expect(page.getByText("상품 목록")).toBeVisible({ timeout: 10000 });
	});

	test("상품 등록 버튼 클릭 시 모달이 열린다", async ({ page }) => {
		await page.getByRole("button", { name: "상품 등록" }).click();
		await expect(page.getByText("상품 등록", { exact: false })).toBeVisible();
		await expect(page.getByLabel("SKU")).toBeVisible();
		await expect(page.getByLabel("상품명")).toBeVisible();
	});

	test("CSV 다운로드 버튼이 존재한다", async ({ page }) => {
		await expect(page.getByRole("button", { name: "CSV 다운로드" })).toBeVisible({
			timeout: 10000,
		});
	});
});
