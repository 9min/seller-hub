import { expect, test } from "@playwright/test";

test.describe("인증 플로우", () => {
	test("비인증 상태에서 / 접근 시 /login으로 리다이렉트", async ({ page }) => {
		// 세션 없이 루트 접근
		await page.goto("/");
		await expect(page).toHaveURL(/\/login/);
	});

	test("비인증 상태에서 /orders 접근 시 /login으로 리다이렉트", async ({ page }) => {
		await page.goto("/orders");
		await expect(page).toHaveURL(/\/login/);
	});

	test("로그인 페이지에 이메일/비밀번호 폼이 존재", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByLabel("이메일")).toBeVisible();
		await expect(page.getByLabel("비밀번호")).toBeVisible();
		await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
	});

	test("잘못된 자격증명으로 로그인 시 에러 메시지 표시", async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("이메일").fill("wrong@example.com");
		await page.getByLabel("비밀번호").fill("wrongpassword");
		await page.getByRole("button", { name: "로그인" }).click();

		// 에러 메시지가 나타날 때까지 대기
		await expect(page.locator("p.text-red-600")).toBeVisible({ timeout: 5000 });
	});
});
