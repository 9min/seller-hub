import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
	title: string;
	children: React.ReactNode;
}

export function AppLayout({ title, children }: AppLayoutProps) {
	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			<Sidebar />
			<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
				<Header title={title} />
				<main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
