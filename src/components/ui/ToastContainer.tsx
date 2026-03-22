import { useToastStore } from "@/stores/toastStore";
import { cn } from "@/utils/cn";

const TYPE_STYLES = {
	success: "bg-green-50 border-green-200 text-green-800",
	error: "bg-red-50 border-red-200 text-red-800",
	info: "bg-blue-50 border-blue-200 text-blue-800",
	warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
} as const;

export function ToastContainer() {
	const toasts = useToastStore((s) => s.toasts);
	const removeToast = useToastStore((s) => s.removeToast);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={cn(
						"px-4 py-3 rounded-lg border shadow-sm text-sm flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]",
						TYPE_STYLES[toast.type],
					)}
					role="alert"
				>
					<span className="flex-1">{toast.message}</span>
					<button
						type="button"
						onClick={() => removeToast(toast.id)}
						className="opacity-60 hover:opacity-100 text-current"
						aria-label="닫기"
					>
						&times;
					</button>
				</div>
			))}
		</div>
	);
}
