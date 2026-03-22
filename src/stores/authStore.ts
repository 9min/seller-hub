import { create } from "zustand";

import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import type { AuthActions, AuthState } from "@/types/auth";
import type { UserRole } from "@/types/role";

async function fetchUserRole(userId: string): Promise<UserRole> {
	try {
		const { data } = await supabase.from("sellers").select("role").eq("id", userId).single();
		const role = data?.role;
		if (role === "admin" || role === "seller" || role === "viewer") return role;
		return "seller";
	} catch {
		return "seller";
	}
}

/** 세션이 있으면 즉시 인증 상태로 설정하고, role은 백그라운드에서 조회 */
function setAuthenticated(
	set: (state: Partial<AuthState>) => void,
	session: AuthState["session"],
	user: AuthState["user"],
) {
	// 즉시 인증 상태 반영 (리다이렉트 즉시 가능)
	set({ session, user, isAuthenticated: true, isLoading: false });

	// role은 백그라운드에서 조회 후 업데이트
	if (user) {
		fetchUserRole(user.id).then((role) => set({ role }));
	}
}

const INITIAL_STATE: AuthState = {
	user: null,
	session: null,
	isLoading: true,
	isAuthenticated: false,
	role: "seller",
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	...INITIAL_STATE,

	initialize: () => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				if (session?.user) {
					setAuthenticated(set, session, session.user);
				} else {
					set({ ...INITIAL_STATE, isLoading: false });
				}
			})
			.catch(() => {
				set({ ...INITIAL_STATE, isLoading: false });
			});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "INITIAL_SESSION") return;

			if (session?.user) {
				setAuthenticated(set, session, session.user);
			} else {
				set({ ...INITIAL_STATE, isLoading: false });
			}
		});

		return () => subscription.unsubscribe();
	},

	signIn: async (email, password) => {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw error;
	},

	signUp: async (email, password) => {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) throw error;

		if (data.user) {
			await supabase
				.from("sellers")
				.upsert({ id: data.user.id, email, name: "" }, { onConflict: "id" });
		}
	},

	signOut: async () => {
		set({ ...INITIAL_STATE, isLoading: false });
		queryClient.clear();

		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	},
}));
