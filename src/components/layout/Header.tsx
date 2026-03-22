import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

interface HeaderProps {
	title: string;
}

export function Header({ title }: HeaderProps) {
	const user = useAuthStore((s) => s.user);
	const signOut = useAuthStore((s) => s.signOut);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);

	const email = user?.email ?? "";
	const initial = email.charAt(0).toUpperCase() || "S";

	return (
		<header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="사이드바 토글">
					☰
				</Button>
				<h1 className="text-lg font-semibold text-gray-900">{title}</h1>
			</div>
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
					{initial}
				</div>
				<span className="text-sm text-gray-600">{email || "셀러 관리자"}</span>
				<Button variant="ghost" size="sm" onClick={() => signOut().catch(console.error)}>
					로그아웃
				</Button>
			</div>
		</header>
	);
}
