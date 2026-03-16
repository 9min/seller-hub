import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import { PRODUCT_STATUS_LABEL } from "@/constants/productStatus";
import type { ProductStatus } from "@/types/product";
import { cn } from "@/utils/cn";

interface ProductsFilterBarProps {
	categories: string[];
	statuses: ProductStatus[];
	onCategoriesChange: (categories: string[]) => void;
	onStatusesChange: (statuses: ProductStatus[]) => void;
	onReset: () => void;
}

export function ProductsFilterBar({
	categories,
	statuses,
	onCategoriesChange,
	onStatusesChange,
	onReset,
}: ProductsFilterBarProps) {
	const hasFilter = categories.length > 0 || statuses.length > 0;

	function handleCategoryToggle(category: string) {
		if (categories.includes(category)) {
			onCategoriesChange(categories.filter((c) => c !== category));
		} else {
			onCategoriesChange([...categories, category]);
		}
	}

	function handleStatusToggle(status: ProductStatus) {
		if (statuses.includes(status)) {
			onStatusesChange(statuses.filter((s) => s !== status));
		} else {
			onStatusesChange([...statuses, status]);
		}
	}

	return (
		<div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
			{/* 카테고리 필터 */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="whitespace-nowrap text-xs font-medium text-gray-500">카테고리</span>
				{PRODUCT_CATEGORIES.map((cat) => (
					<label key={cat} className="flex cursor-pointer items-center gap-1">
						<input
							type="checkbox"
							checked={categories.includes(cat)}
							onChange={() => handleCategoryToggle(cat)}
							className="h-3.5 w-3.5 accent-violet-600"
						/>
						<span className="whitespace-nowrap text-xs text-gray-700">{cat}</span>
					</label>
				))}
			</div>

			{/* 상태 필터 */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="whitespace-nowrap text-xs font-medium text-gray-500">상태</span>
				{(Object.entries(PRODUCT_STATUS_LABEL) as [ProductStatus, string][]).map(([key, label]) => (
					<label key={key} className="flex cursor-pointer items-center gap-1">
						<input
							type="checkbox"
							checked={statuses.includes(key)}
							onChange={() => handleStatusToggle(key)}
							className="h-3.5 w-3.5 accent-violet-600"
						/>
						<span className="whitespace-nowrap text-xs text-gray-700">{label}</span>
					</label>
				))}
			</div>

			<button
				type="button"
				onClick={onReset}
				disabled={!hasFilter}
				className={cn(
					"ml-auto rounded border px-3 py-1.5 text-xs transition-colors",
					hasFilter
						? "border-gray-300 text-gray-600 hover:bg-gray-50"
						: "cursor-not-allowed border-gray-200 text-gray-300",
				)}
			>
				초기화
			</button>
		</div>
	);
}
