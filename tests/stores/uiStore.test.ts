import { beforeEach, describe, expect, it } from "vitest";

import { useUiStore } from "@/stores/uiStore";

describe("uiStore", () => {
	beforeEach(() => {
		useUiStore.setState({ isSidebarOpen: true });
	});

	it("초기 상태는 사이드바 열림이다", () => {
		expect(useUiStore.getState().isSidebarOpen).toBe(true);
	});

	it("toggleSidebar는 사이드바 상태를 토글한다", () => {
		useUiStore.getState().toggleSidebar();
		expect(useUiStore.getState().isSidebarOpen).toBe(false);

		useUiStore.getState().toggleSidebar();
		expect(useUiStore.getState().isSidebarOpen).toBe(true);
	});

	it("setSidebarOpen은 사이드바 상태를 직접 설정한다", () => {
		useUiStore.getState().setSidebarOpen(false);
		expect(useUiStore.getState().isSidebarOpen).toBe(false);

		useUiStore.getState().setSidebarOpen(true);
		expect(useUiStore.getState().isSidebarOpen).toBe(true);
	});
});
