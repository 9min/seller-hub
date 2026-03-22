import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.describe("매출 분석", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
		await page.goto("/analytics");
	});

	test("매출 분석 페이지가 렌더링된다", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "매출 분석" })).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole("button", { name: "7일" })).toBeVisible();
		await expect(page.getByRole("button", { name: "30일" })).toBeVisible();
		await expect(page.getByRole("button", { name: "90일" })).toBeVisible();
	});

	test("기간 탭 전환 시 URL이 변경된다", async ({ page }) => {
		await page.getByRole("button", { name: "7일" }).click();
		await expect(page).toHaveURL(/days=7/);

		await page.getByRole("button", { name: "90일" }).click();
		await expect(page).toHaveURL(/days=90/);
	});

	test("커스텀 탭 선택 시 DateRangePicker가 표시된다", async ({ page }) => {
		await page.getByRole("button", { name: "커스텀" }).click();
		await expect(page).toHaveURL(/days=custom/);
		await expect(page.getByLabel("시작일")).toBeVisible();
		await expect(page.getByLabel("종료일")).toBeVisible();
	});
});
