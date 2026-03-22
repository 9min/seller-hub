import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { useUiStore } from "@/stores/uiStore";

interface HeaderProps {
	title: string;
}

const ROLE_LABEL = { admin: "관리자", seller: "셀러", viewer: "뷰어" } as const;

export function Header({ title }: HeaderProps) {
	const user = useAuthStore((s) => s.user);
	const role = useAuthStore((s) => s.role);
	const signOut = useAuthStore((s) => s.signOut);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);

	const email = user?.email ?? "";
	const initial = email.charAt(0).toUpperCase() || "S";

	return (
		<header className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white border-b border-gray-200 flex-shrink-0">
			<div className="flex items-center gap-2 md:gap-3">
				<Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="사이드바 토글">
					☰
				</Button>
				<h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{title}</h1>
			</div>
			<div className="flex items-center gap-2 md:gap-3">
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
					{initial}
				</div>
				<span className="hidden sm:inline text-sm text-gray-600">{email || "셀러 관리자"}</span>
				<span className="hidden sm:inline px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
					{ROLE_LABEL[role]}
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						signOut().catch(() => {
							useToastStore.getState().addToast({
								message: "로그아웃에 실패했습니다. 다시 시도해주세요.",
								type: "error",
								duration: 5000,
							});
						})
					}
				>
					로그아웃
				</Button>
			</div>
		</header>
	);
}
