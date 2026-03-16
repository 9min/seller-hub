import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AnalyticsCategoryPoint } from "@/types/analytics";
import { formatCurrency } from "@/utils/formatNumber";

interface AnalyticsCategoryChartProps {
	categoryData: AnalyticsCategoryPoint[] | undefined;
	isLoading?: boolean;
}

export function AnalyticsCategoryChart({ categoryData, isLoading }: AnalyticsCategoryChartProps) {
	if (isLoading) return <Skeleton className="h-80" />;

	return (
		<Card>
			<h2 className="mb-4 text-sm font-semibold text-gray-700">카테고리별 매출</h2>
			<ResponsiveContainer width="100%" height={240}>
				<BarChart
					data={categoryData ?? []}
					margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
					layout="vertical"
				>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
					<XAxis
						type="number"
						tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
						tick={{ fontSize: 11, fill: "#9ca3af" }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						type="category"
						dataKey="name"
						tick={{ fontSize: 11, fill: "#6b7280" }}
						axisLine={false}
						tickLine={false}
						width={60}
					/>
					<Tooltip
						formatter={(value) => [formatCurrency(typeof value === "number" ? value : 0), "매출"]}
					/>
					<Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
						{(categoryData ?? []).map((entry) => (
							<Cell key={entry.name} fill={entry.color} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}
