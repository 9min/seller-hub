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

	return (
		<aside
			className={cn(
				"flex flex-col flex-shrink-0 bg-gray-900 text-white transition-[width] duration-200",
				isSidebarOpen ? "w-60" : "w-16",
			)}
		>
			<div className="flex items-center h-16 px-6 border-b border-gray-700">
				{isSidebarOpen && <span className="text-lg font-bold tracking-tight">Seller-Hub</span>}
			</div>
			<nav className="flex-1 px-3 py-4 space-y-1">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						end={item.to === "/"}
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
				))}
			</nav>
		</aside>
	);
}
