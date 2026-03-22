import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useToastStore } from "@/stores/toastStore";

describe("toastStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		useToastStore.setState({ toasts: [] });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("addToast는 토스트를 추가한다", () => {
		useToastStore.getState().addToast({
			message: "성공",
			type: "success",
			duration: 3000,
		});

		const toasts = useToastStore.getState().toasts;
		expect(toasts).toHaveLength(1);
		expect(toasts[0].message).toBe("성공");
		expect(toasts[0].type).toBe("success");
	});

	it("removeToast는 토스트를 제거한다", () => {
		useToastStore.getState().addToast({
			message: "테스트",
			type: "info",
			duration: 0,
		});

		const id = useToastStore.getState().toasts[0].id;
		useToastStore.getState().removeToast(id);

		expect(useToastStore.getState().toasts).toHaveLength(0);
	});

	it("duration 후 자동으로 토스트가 제거된다", () => {
		useToastStore.getState().addToast({
			message: "자동 제거",
			type: "success",
			duration: 3000,
		});

		expect(useToastStore.getState().toasts).toHaveLength(1);

		vi.advanceTimersByTime(3000);

		expect(useToastStore.getState().toasts).toHaveLength(0);
	});

	it("duration이 0이면 자동 제거하지 않는다", () => {
		useToastStore.getState().addToast({
			message: "수동 닫기",
			type: "warning",
			duration: 0,
		});

		vi.advanceTimersByTime(10000);

		expect(useToastStore.getState().toasts).toHaveLength(1);
	});

	it("여러 토스트를 동시에 관리한다", () => {
		const { addToast } = useToastStore.getState();
		addToast({ message: "첫 번째", type: "success", duration: 0 });
		addToast({ message: "두 번째", type: "error", duration: 0 });
		addToast({ message: "세 번째", type: "info", duration: 0 });

		expect(useToastStore.getState().toasts).toHaveLength(3);
	});
});
