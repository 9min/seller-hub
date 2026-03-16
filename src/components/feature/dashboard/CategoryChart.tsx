import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { computeCategoryData } from "@/constants/dummyData";
import type { Order } from "@/types/order";

interface CategoryChartProps {
	orders: Order[];
	isLoading?: boolean;
}

export function CategoryChart({ orders, isLoading }: CategoryChartProps) {
	const categoryData = useMemo(() => computeCategoryData(orders), [orders]);

	if (isLoading) {
		return <Skeleton className="h-80" />;
	}

	return (
		<Card>
			<h2 className="text-sm font-semibold text-gray-700 mb-4">카테고리별 판매 비중</h2>
			<ResponsiveContainer width="100%" height={240}>
				<PieChart>
					<Pie
						data={categoryData}
						cx="50%"
						cy="45%"
						innerRadius={55}
						outerRadius={90}
						paddingAngle={3}
						dataKey="value"
						animationBegin={0}
						animationDuration={600}
					>
						{categoryData.map((entry) => (
							<Cell key={entry.name} fill={entry.color} />
						))}
					</Pie>
					<Tooltip
						formatter={(value) => [
							typeof value === "number"
								? `${new Intl.NumberFormat("ko-KR").format(value)}건`
								: String(value),
							"판매량",
						]}
						contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
					/>
					<Legend
						iconType="circle"
						iconSize={8}
						formatter={(value: string) => (
							<span style={{ fontSize: "11px", color: "#6b7280" }}>{value}</span>
						)}
					/>
				</PieChart>
			</ResponsiveContainer>
		</Card>
	);
}
