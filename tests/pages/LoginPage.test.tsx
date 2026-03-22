import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignIn = vi.fn();

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

import { LoginPage } from "@/pages/LoginPage";
import { useAuthStore } from "@/stores/authStore";

describe("LoginPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			user: null,
			session: null,
			isLoading: false,
			isAuthenticated: false,
			signIn: mockSignIn,
		});
	});

	const renderLoginPage = () =>
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

	it("로그인 폼을 렌더링한다", () => {
		renderLoginPage();

		expect(screen.getByText("Seller Hub")).toBeInTheDocument();
		expect(screen.getByLabelText("이메일")).toBeInTheDocument();
		expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
	});

	it("로그인 버튼 클릭 시 signIn을 호출한다", async () => {
		mockSignIn.mockResolvedValue(undefined);
		const user = userEvent.setup();

		renderLoginPage();

		await user.type(screen.getByLabelText("이메일"), "seller@example.com");
		await user.type(screen.getByLabelText("비밀번호"), "password123");
		await user.click(screen.getByRole("button", { name: "로그인" }));

		expect(mockSignIn).toHaveBeenCalledWith("seller@example.com", "password123");
	});

	it("로그인 실패 시 에러 메시지를 표시한다", async () => {
		mockSignIn.mockRejectedValue(new Error("Invalid login credentials"));
		const user = userEvent.setup();

		renderLoginPage();

		await user.type(screen.getByLabelText("이메일"), "wrong@example.com");
		await user.type(screen.getByLabelText("비밀번호"), "wrong");
		await user.click(screen.getByRole("button", { name: "로그인" }));

		expect(await screen.findByText("Invalid login credentials")).toBeInTheDocument();
	});

	it("로딩 중에는 로딩 화면을 표시한다", () => {
		useAuthStore.setState({ isLoading: true });

		renderLoginPage();

		expect(screen.getByText("로딩 중...")).toBeInTheDocument();
	});
});
