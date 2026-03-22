import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// .env.local에서 E2E 환경변수 로드
try {
	const env = readFileSync(".env.local", "utf-8");
	for (const line of env.split("\n")) {
		const match = line.match(/^([^=]+)=(.*)$/);
		if (match && !process.env[match[1].trim()]) {
			process.env[match[1].trim()] = match[2].trim();
		}
	}
} catch {
	/* 파일 없으면 무시 */
}

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
});
