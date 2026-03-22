import type { Session, User } from "@supabase/supabase-js";

export type { Session, User };

export interface AuthState {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

export interface AuthActions {
	initialize: () => () => void;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}
