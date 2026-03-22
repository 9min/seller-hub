import { Input } from "./Input";

interface DateRangePickerProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: DateRangePickerProps) {
	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="flex items-center gap-2">
			<Input
				id="analytics-start"
				type="date"
				value={startDate}
				onChange={(e) => onStartDateChange(e.target.value)}
				max={endDate || today}
				aria-label="시작일"
			/>
			<span className="text-sm text-gray-400">~</span>
			<Input
				id="analytics-end"
				type="date"
				value={endDate}
				onChange={(e) => onEndDateChange(e.target.value)}
				min={startDate || undefined}
				max={today}
				aria-label="종료일"
			/>
		</div>
	);
}
