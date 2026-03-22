import { create } from "zustand";

import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import type { AuthActions, AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	user: null,
	session: null,
	isLoading: true,
	isAuthenticated: false,

	initialize: () => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			set({
				session,
				user: session?.user ?? null,
				isAuthenticated: !!session,
				isLoading: false,
			});
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			set({
				session,
				user: session?.user ?? null,
				isAuthenticated: !!session,
				isLoading: false,
			});
		});

		return () => subscription.unsubscribe();
	},

	signIn: async (email, password) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	},

	signUp: async (email, password) => {
		const { data, error } = await supabase.auth.signUp({ email, password });
		if (error) throw error;

		// 회원가입 성공 시 sellers 행 생성 (트리거 미작동 대비)
		if (data.user) {
			await supabase
				.from("sellers")
				.upsert({ id: data.user.id, email, name: "" }, { onConflict: "id" });
		}
	},

	signOut: async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		queryClient.clear();
	},
}));
