import { ORDER_STATUS_LABEL } from "@/constants/orderStatus";
import type { OrderStatus } from "@/types/order";
import { cn } from "@/utils/cn";

interface OrdersFilterBarProps {
	statuses: OrderStatus[];
	startDate: string;
	endDate: string;
	onStatusesChange: (statuses: OrderStatus[]) => void;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	onReset: () => void;
}

export function OrdersFilterBar({
	statuses,
	startDate,
	endDate,
	onStatusesChange,
	onStartDateChange,
	onEndDateChange,
	onReset,
}: OrdersFilterBarProps) {
	const hasFilter = statuses.length > 0 || startDate !== "" || endDate !== "";

	function handleStatusToggle(status: OrderStatus) {
		if (statuses.includes(status)) {
			onStatusesChange(statuses.filter((s) => s !== status));
		} else {
			onStatusesChange([...statuses, status]);
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-lg mb-3">
			{/* 주문 상태 체크박스 그룹 */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-xs font-medium text-gray-500 whitespace-nowrap">주문 상태</span>
				{(Object.entries(ORDER_STATUS_LABEL) as [OrderStatus, string][]).map(([key, label]) => (
					<label key={key} className="flex items-center gap-1 cursor-pointer">
						<input
							type="checkbox"
							checked={statuses.includes(key)}
							onChange={() => handleStatusToggle(key)}
							className="w-3.5 h-3.5 accent-primary-600"
						/>
						<span className="text-xs text-gray-700 whitespace-nowrap">{label}</span>
					</label>
				))}
			</div>

			{/* 기간 필터 */}
			<div className="flex items-center gap-2">
				<span className="text-xs font-medium text-gray-500 whitespace-nowrap">기간</span>
				<label htmlFor="filter-start-date" className="sr-only">
					시작일
				</label>
				<input
					id="filter-start-date"
					aria-label="시작일"
					type="date"
					value={startDate}
					max={endDate || undefined}
					onChange={(e) => onStartDateChange(e.target.value)}
					className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
				/>
				<span className="text-xs text-gray-400">~</span>
				<label htmlFor="filter-end-date" className="sr-only">
					종료일
				</label>
				<input
					id="filter-end-date"
					aria-label="종료일"
					type="date"
					value={endDate}
					min={startDate || undefined}
					onChange={(e) => onEndDateChange(e.target.value)}
					className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
				/>
			</div>

			{/* 초기화 버튼 */}
			<button
				type="button"
				onClick={onReset}
				disabled={!hasFilter}
				className={cn(
					"ml-auto text-xs px-3 py-1.5 rounded border transition-colors",
					hasFilter
						? "border-gray-300 text-gray-600 hover:bg-gray-50"
						: "border-gray-200 text-gray-300 cursor-not-allowed",
				)}
			>
				초기화
			</button>
		</div>
	);
}
