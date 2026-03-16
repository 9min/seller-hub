import { cn } from "@/utils/cn";
import { formatCount } from "@/utils/formatNumber";

interface PaginationProps {
	page: number; // 0-based
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	isFetching?: boolean;
}

export function Pagination({ page, pageSize, total, onPageChange, isFetching }: PaginationProps) {
	const from = total === 0 ? 0 : page * pageSize + 1;
	const to = Math.min((page + 1) * pageSize, total);
	const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

	const isFirst = page === 0 || isFetching;
	const isLast = page >= lastPage || !!isFetching;

	return (
		<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
			<span className="text-xs text-gray-500 tabular-nums">
				{formatCount(from)}-{formatCount(to)} / {formatCount(total)}건
			</span>
			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={isFirst}
					className={cn(
						"px-3 py-1.5 text-sm rounded-lg border transition-colors",
						isFirst
							? "border-gray-200 text-gray-300 cursor-not-allowed"
							: "border-gray-300 text-gray-600 hover:bg-gray-50",
					)}
				>
					이전
				</button>
				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={isLast}
					className={cn(
						"px-3 py-1.5 text-sm rounded-lg border transition-colors",
						isLast
							? "border-gray-200 text-gray-300 cursor-not-allowed"
							: "border-gray-300 text-gray-600 hover:bg-gray-50",
					)}
				>
					다음
				</button>
			</div>
		</div>
	);
}
