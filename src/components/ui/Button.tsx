import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
	secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
	ghost: "text-gray-600 hover:bg-gray-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-sm",
	lg: "px-5 py-2.5 text-base",
};

export function Button({
	variant = "primary",
	size = "md",
	className,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed",
				VARIANT_CLASSES[variant],
				SIZE_CLASSES[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
