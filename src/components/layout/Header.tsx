interface HeaderProps {
	title: string;
}

export function Header({ title }: HeaderProps) {
	return (
		<header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0">
			<h1 className="text-lg font-semibold text-gray-900">{title}</h1>
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
					S
				</div>
				<span className="text-sm text-gray-600">셀러 관리자</span>
			</div>
		</header>
	);
}
