import { cn } from "@/utils/cn";

interface TabItem<T extends string> {
	value: T;
	label: string;
}

interface TabGroupProps<T extends string> {
	items: TabItem<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
}

export function TabGroup<T extends string>({
	items,
	value,
	onChange,
	className,
}: TabGroupProps<T>) {
	return (
		<div className={cn("flex gap-1 bg-gray-100 rounded-lg p-1", className)}>
			{items.map((item) => (
				<button
					key={item.value}
					type="button"
					onClick={() => onChange(item.value)}
					className={cn(
						"px-3 py-1 text-sm font-medium rounded-md transition-colors",
						value === item.value
							? "bg-white text-gray-900 shadow-sm"
							: "text-gray-500 hover:text-gray-700",
					)}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}
