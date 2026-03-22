import type { Session, User } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockQueryClientClear = vi.fn();

const mockFrom = vi.fn(() => ({
	select: vi.fn(() => ({
		eq: vi.fn(() => ({
			single: vi.fn(() => Promise.resolve({ data: { role: "seller" }, error: null })),
		})),
	})),
	upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
}));

vi.mock("@/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: (...args: unknown[]) => mockGetSession(...args),
			signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
			signUp: (...args: unknown[]) => mockSignUp(...args),
			signOut: (...args: unknown[]) => mockSignOut(...args),
			onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
		},
		from: (...args: unknown[]) => mockFrom(...args),
	},
}));

vi.mock("@/lib/queryClient", () => ({
	queryClient: { clear: (...args: unknown[]) => mockQueryClientClear(...args) },
}));

import { useAuthStore } from "@/stores/authStore";

const mockUser: User = {
	id: "user-123",
	email: "seller@example.com",
	aud: "authenticated",
	role: "authenticated",
	app_metadata: {},
	user_metadata: {},
	created_at: "2026-01-01T00:00:00Z",
	identities: [],
} as unknown as User;

const mockSession: Session = {
	access_token: "token-abc",
	refresh_token: "refresh-abc",
	expires_in: 3600,
	token_type: "bearer",
	user: mockUser,
} as Session;

describe("authStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockOnAuthStateChange.mockReturnValue({
			data: { subscription: { unsubscribe: vi.fn() } },
		});
		useAuthStore.setState({
			user: null,
			session: null,
			isLoading: true,
			isAuthenticated: false,
			role: "seller",
		});
	});

	afterEach(() => {
		useAuthStore.setState({
			user: null,
			session: null,
			isLoading: true,
			isAuthenticated: false,
			role: "seller",
		});
	});

	it("초기 상태는 로딩 중이고 미인증이다", () => {
		const state = useAuthStore.getState();

		expect(state.isLoading).toBe(true);
		expect(state.isAuthenticated).toBe(false);
		expect(state.user).toBeNull();
		expect(state.session).toBeNull();
	});

	it("initialize는 세션을 가져오고 인증 상태를 업데이트한다", async () => {
		mockGetSession.mockResolvedValue({ data: { session: mockSession } });

		useAuthStore.getState().initialize();

		await vi.waitFor(() => {
			expect(useAuthStore.getState().isLoading).toBe(false);
		});

		const state = useAuthStore.getState();
		expect(state.isAuthenticated).toBe(true);
		expect(state.user?.id).toBe("user-123");
		expect(state.session?.access_token).toBe("token-abc");
	});

	it("initialize는 세션이 없으면 미인증 상태를 설정한다", async () => {
		mockGetSession.mockResolvedValue({ data: { session: null } });

		useAuthStore.getState().initialize();

		await vi.waitFor(() => {
			expect(useAuthStore.getState().isLoading).toBe(false);
		});

		const state = useAuthStore.getState();
		expect(state.isAuthenticated).toBe(false);
		expect(state.user).toBeNull();
	});

	it("initialize는 onAuthStateChange 리스너를 등록하고 정리 함수를 반환한다", () => {
		mockGetSession.mockResolvedValue({ data: { session: null } });
		const unsubscribe = vi.fn();
		mockOnAuthStateChange.mockReturnValue({
			data: { subscription: { unsubscribe } },
		});

		const cleanup = useAuthStore.getState().initialize();

		expect(mockOnAuthStateChange).toHaveBeenCalled();
		cleanup();
		expect(unsubscribe).toHaveBeenCalled();
	});

	it("signIn은 supabase.auth.signInWithPassword를 호출한다", async () => {
		mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });

		await useAuthStore.getState().signIn("seller@example.com", "password123");

		expect(mockSignInWithPassword).toHaveBeenCalledWith({
			email: "seller@example.com",
			password: "password123",
		});
	});

	it("signIn 실패 시 에러를 throw한다", async () => {
		const authError = new Error("Invalid login credentials");
		mockSignInWithPassword.mockResolvedValue({ data: null, error: authError });

		await expect(useAuthStore.getState().signIn("wrong@example.com", "wrong")).rejects.toThrow(
			"Invalid login credentials",
		);
	});

	it("signUp은 supabase.auth.signUp을 호출한다", async () => {
		mockSignUp.mockResolvedValue({ data: {}, error: null });

		await useAuthStore.getState().signUp("new@example.com", "password123");

		expect(mockSignUp).toHaveBeenCalledWith({
			email: "new@example.com",
			password: "password123",
		});
	});

	it("signOut은 supabase.auth.signOut을 호출하고 queryClient를 초기화한다", async () => {
		mockSignOut.mockResolvedValue({ error: null });

		await useAuthStore.getState().signOut();

		expect(mockSignOut).toHaveBeenCalled();
		expect(mockQueryClientClear).toHaveBeenCalled();
	});

	it("signOut 실패 시 에러를 throw한다", async () => {
		const authError = new Error("Sign out failed");
		mockSignOut.mockResolvedValue({ error: authError });

		await expect(useAuthStore.getState().signOut()).rejects.toThrow("Sign out failed");
	});
});
