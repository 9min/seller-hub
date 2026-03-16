import type { BadgeVariant } from "@/constants/orderStatus";
import { cn } from "@/utils/cn";

interface BadgeProps {
	children: React.ReactNode;
	variant: BadgeVariant;
	className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
	success: "bg-green-100 text-green-800",
	warning: "bg-yellow-100 text-yellow-800",
	error: "bg-red-100 text-red-800",
	info: "bg-blue-100 text-blue-800",
	default: "bg-gray-100 text-gray-700",
};

export function Badge({ children, variant, className }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full",
				VARIANT_CLASSES[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
