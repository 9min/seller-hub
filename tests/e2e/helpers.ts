import type { Page } from "@playwright/test";

const TEST_EMAIL = process.env.E2E_EMAIL ?? "jjooaa0205@gmail.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "test1234";

/**
 * 로그인 페이지에서 인증을 수행한다.
 * 이미 로그인된 상태이면 대시보드로 바로 이동한다.
 */
export async function login(page: Page) {
	await page.goto("/");

	// 이미 로그인된 상태이면 스킵
	if (!page.url().includes("/login")) return;

	await page.fill("#email", TEST_EMAIL);
	await page.fill("#password", TEST_PASSWORD);
	await page.click('button[type="submit"]');

	// 대시보드로 이동될 때까지 대기
	await page.waitForURL("/", { timeout: 15000 });
}
