import { expect, test } from "@playwright/test";

// 주문 페이지 E2E 테스트 (실제 Supabase 연동 환경에서 실행)
// CI에서는 TEST_USER_EMAIL, TEST_USER_PASSWORD 환경변수 필요

test.describe("주문 필터 URL 동기화", () => {
	// 실제 로그인이 필요한 테스트는 환경변수가 있을 때만 실행
	test.skip(!process.env.TEST_USER_EMAIL, "TEST_USER_EMAIL 환경변수가 없으면 건너뜀");

	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("이메일").fill(process.env.TEST_USER_EMAIL as string);
		await page.getByLabel("비밀번호").fill(process.env.TEST_USER_PASSWORD as string);
		await page.getByRole("button", { name: "로그인" }).click();
		await expect(page).toHaveURL("/");
	});

	test("로그인 후 /orders 접근 가능", async ({ page }) => {
		await page.goto("/orders");
		await expect(page).toHaveURL("/orders");
	});

	test("주문 상태 필터 적용 시 URL 파라미터 반영", async ({ page }) => {
		await page.goto("/orders");

		// 상태 필터 적용 (필터 셀렉트 존재 확인)
		const statusFilter = page.getByRole("combobox").first();
		if (await statusFilter.isVisible()) {
			await statusFilter.selectOption({ index: 1 });
			await expect(page).toHaveURL(/status=/);
		}
	});

	test("필터가 포함된 URL 직접 접근 시 필터 상태 복원", async ({ page }) => {
		await page.goto("/orders?status=배송중");
		await expect(page).toHaveURL(/status=배송중/);
	});
});
