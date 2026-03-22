import { create } from "zustand";

export interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info" | "warning";
	duration: number;
}

interface ToastState {
	toasts: Toast[];
}

interface ToastActions {
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState & ToastActions>((set) => ({
	toasts: [],

	addToast: (toast) => {
		const id = String(++toastId);
		set((state) => ({
			toasts: [...state.toasts, { ...toast, id }],
		}));

		if (toast.duration > 0) {
			setTimeout(() => {
				set((state) => ({
					toasts: state.toasts.filter((t) => t.id !== id),
				}));
			}, toast.duration);
		}
	},

	removeToast: (id) =>
		set((state) => ({
			toasts: state.toasts.filter((t) => t.id !== id),
		})),
}));
