import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.describe("인증 플로우", () => {
	test("미인증 상태에서 / 접근 시 /login으로 리다이렉트", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL(/\/login/);
	});

	test("로그인 폼이 렌더링된다", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByText("Seller Hub")).toBeVisible();
		await expect(page.getByLabel("이메일")).toBeVisible();
		await expect(page.getByLabel("비밀번호")).toBeVisible();
		await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
	});

	test("로그인 성공 후 대시보드로 이동", async ({ page }) => {
		await login(page);
		await expect(page).toHaveURL("/");
		await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible({ timeout: 10000 });
	});

	test("로그아웃 후 /login으로 리다이렉트", async ({ page }) => {
		await login(page);
		await page.getByRole("button", { name: "로그아웃" }).click();
		await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
	});

	test("미인증 상태에서 보호된 페이지 접근 시 리다이렉트", async ({ page }) => {
		await page.goto("/orders");
		await expect(page).toHaveURL(/\/login/);

		await page.goto("/products");
		await expect(page).toHaveURL(/\/login/);

		await page.goto("/analytics");
		await expect(page).toHaveURL(/\/login/);
	});
});
