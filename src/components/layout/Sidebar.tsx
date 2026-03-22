import { NavLink } from "react-router-dom";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

interface NavItem {
	to: string;
	label: string;
	icon: string;
}

const NAV_ITEMS: NavItem[] = [
	{ to: "/", label: "대시보드", icon: "📊" },
	{ to: "/orders", label: "주문 관리", icon: "📦" },
	{ to: "/products", label: "상품 관리", icon: "🛍️" },
	{ to: "/analytics", label: "매출 분석", icon: "📈" },
];

export function Sidebar() {
	const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
	const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

	return (
		<>
			{/* 모바일 backdrop */}
			{isSidebarOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/40 md:hidden cursor-default"
					onClick={() => setSidebarOpen(false)}
					aria-label="사이드바 닫기"
				/>
			)}

			{/* 모바일 drawer (fixed, md 미만에서만 표시) */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-gray-900 text-white transition-transform duration-200 md:hidden",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<SidebarContent isSidebarOpen={true} setSidebarOpen={setSidebarOpen} />
			</aside>

			{/* 데스크탑 사이드바 (인라인, md 이상에서만 표시) */}
			<aside
				className={cn(
					"hidden md:flex flex-col flex-shrink-0 bg-gray-900 text-white transition-[width] duration-200",
					isSidebarOpen ? "w-60" : "w-16",
				)}
			>
				<SidebarContent isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
			</aside>
		</>
	);
}

function SidebarContent({
	isSidebarOpen,
	setSidebarOpen,
}: {
	isSidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}) {
	return (
		<>
			<div className="flex items-center h-16 px-6 border-b border-gray-700">
				{isSidebarOpen && <span className="text-lg font-bold tracking-tight">Seller-Hub</span>}
			</div>
			<nav className="flex-1 px-3 py-4" aria-label="메인 네비게이션">
				<ul className="space-y-1">
					{NAV_ITEMS.map((item) => (
						<li key={item.to}>
							<NavLink
								to={item.to}
								end={item.to === "/"}
								onClick={() => {
									if (window.innerWidth < 768) setSidebarOpen(false);
								}}
								className={({ isActive }) =>
									cn(
										"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
										isActive
											? "bg-primary-600 text-white"
											: "text-gray-400 hover:bg-gray-800 hover:text-white",
										!isSidebarOpen && "justify-center",
									)
								}
								title={item.label}
							>
								<span aria-hidden="true">{item.icon}</span>
								{isSidebarOpen && item.label}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</>
	);
}
