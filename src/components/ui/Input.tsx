import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label htmlFor={id} className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<input
				id={id}
				className={cn(
					"px-3 py-2 text-sm border rounded-lg transition-colors",
					"focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
					"disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50",
					error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300",
					className,
				)}
				aria-invalid={!!error}
				aria-describedby={error && id ? `${id}-error` : undefined}
				{...props}
			/>
			{error && (
				<p id={id ? `${id}-error` : undefined} className="text-sm text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
