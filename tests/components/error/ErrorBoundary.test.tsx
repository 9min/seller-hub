import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "@/components/error/ErrorBoundary";

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
	if (shouldThrow) {
		throw new Error("테스트 에러");
	}
	return <div>정상 렌더링</div>;
}

describe("ErrorBoundary", () => {
	beforeEach(() => {
		// console.error 억제 (React가 에러를 콘솔에 출력)
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("자식 컴포넌트를 정상 렌더링한다", () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={false} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("정상 렌더링")).toBeInTheDocument();
	});

	it("자식 컴포넌트 에러 시 기본 폴백 UI를 표시한다", () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
		expect(screen.getByText("테스트 에러")).toBeInTheDocument();
	});

	it("다시 시도 버튼을 클릭하면 에러 상태를 리셋한다", async () => {
		const user = userEvent.setup();
		let shouldThrow = true;

		function ConditionalThrower() {
			if (shouldThrow) {
				throw new Error("테스트 에러");
			}
			return <div>정상 렌더링</div>;
		}

		render(
			<ErrorBoundary>
				<ConditionalThrower />
			</ErrorBoundary>,
		);

		expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();

		// 에러 조건 해제 후 리셋
		shouldThrow = false;
		await user.click(screen.getByRole("button", { name: "다시 시도" }));

		expect(screen.getByText("정상 렌더링")).toBeInTheDocument();
	});

	it("커스텀 fallback을 사용할 수 있다", () => {
		render(
			<ErrorBoundary fallback={({ error }) => <div>커스텀 에러: {error.message}</div>}>
				<ThrowingComponent shouldThrow={true} />
			</ErrorBoundary>,
		);

		expect(screen.getByText("커스텀 에러: 테스트 에러")).toBeInTheDocument();
	});
});
