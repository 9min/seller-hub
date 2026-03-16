import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TabGroup } from "@/components/ui/TabGroup";
import type { ChartPeriod, SalesDataPoint } from "@/types/chart";

const PERIOD_TABS: { value: ChartPeriod; label: string }[] = [
	{ value: "daily", label: "일별" },
	{ value: "weekly", label: "주별" },
	{ value: "monthly", label: "월별" },
];

interface SalesChartProps {
	salesData: SalesDataPoint[] | undefined;
	period: ChartPeriod;
	onPeriodChange: (period: ChartPeriod) => void;
	isLoading?: boolean;
}

export function SalesChart({ salesData, period, onPeriodChange, isLoading }: SalesChartProps) {
	if (isLoading) {
		return <Skeleton className="h-80" />;
	}

	return (
		<Card>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold text-gray-700">매출 추이</h2>
				<TabGroup items={PERIOD_TABS} value={period} onChange={onPeriodChange} />
			</div>
			<ResponsiveContainer width="100%" height={240}>
				<LineChart data={salesData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
						interval="preserveStartEnd"
					/>
					<YAxis
						tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						formatter={(value) => [
							typeof value === "number"
								? new Intl.NumberFormat("ko-KR", {
										style: "currency",
										currency: "KRW",
										maximumFractionDigits: 0,
									}).format(value)
								: String(value),
							"매출",
						]}
						contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
					/>
					<Line
						type="monotone"
						dataKey="revenue"
						stroke="#2563eb"
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4, fill: "#2563eb" }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	);
}
