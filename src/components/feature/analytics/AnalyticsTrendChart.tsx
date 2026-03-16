import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AnalyticsTrendPoint } from "@/types/analytics";
import { formatCurrency } from "@/utils/formatNumber";

interface AnalyticsTrendChartProps {
	trendData: AnalyticsTrendPoint[] | undefined;
	isLoading?: boolean;
}

export function AnalyticsTrendChart({ trendData, isLoading }: AnalyticsTrendChartProps) {
	if (isLoading) return <Skeleton className="h-80" />;

	return (
		<Card>
			<h2 className="mb-4 text-sm font-semibold text-gray-700">매출 추이 비교</h2>
			<ResponsiveContainer width="100%" height={260}>
				<LineChart data={trendData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
					<XAxis
						dataKey="label"
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
						interval="preserveStartEnd"
					/>
					<YAxis
						tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						formatter={(value, name) => [
							formatCurrency(typeof value === "number" ? value : 0),
							name === "currentRevenue" ? "이번 기간" : "이전 기간",
						]}
					/>
					<Legend formatter={(value) => (value === "currentRevenue" ? "이번 기간" : "이전 기간")} />
					<Line
						type="monotone"
						dataKey="currentRevenue"
						stroke="#2563eb"
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4 }}
					/>
					<Line
						type="monotone"
						dataKey="previousRevenue"
						stroke="#9ca3af"
						strokeWidth={2}
						dot={false}
						strokeDasharray="4 4"
						activeDot={{ r: 4 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	);
}
