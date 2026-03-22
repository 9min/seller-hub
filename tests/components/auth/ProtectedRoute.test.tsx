import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
	},
}));

vi.mock("@/lib/queryClient", () => ({
	queryClient: { clear: vi.fn() },
}));

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderWithRouter = (initialRoute = "/") =>
		render(
			<MemoryRouter initialEntries={[initialRoute]}>
				<Routes>
					<Route path="/login" element={<div>로그인 페이지</div>} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<div>대시보드</div>} />
					</Route>
				</Routes>
			</MemoryRouter>,
		);

	it("인증된 사용자는 자식 라우트를 렌더링한다", () => {
		useAuthStore.setState({
			isAuthenticated: true,
			isLoading: false,
		});

		renderWithRouter();

		expect(screen.getByText("대시보드")).toBeInTheDocument();
	});

	it("미인증 사용자는 로그인 페이지로 리다이렉트된다", () => {
		useAuthStore.setState({
			isAuthenticated: false,
			isLoading: false,
		});

		renderWithRouter();

		expect(screen.getByText("로그인 페이지")).toBeInTheDocument();
	});

	it("로딩 중에는 로딩 화면을 표시한다", () => {
		useAuthStore.setState({
			isAuthenticated: false,
			isLoading: true,
		});

		renderWithRouter();

		expect(screen.getByText("인증 확인 중...")).toBeInTheDocument();
	});
});
