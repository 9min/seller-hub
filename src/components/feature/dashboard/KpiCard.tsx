import { memo } from "react";
import { Card } from "@/components/ui/Card";
import type { KpiMetric } from "@/types/kpi";
import { cn } from "@/utils/cn";

interface KpiCardProps {
	metric: KpiMetric;
}

export const KpiCard = memo(function KpiCard({ metric }: KpiCardProps) {
	const trendColor = {
		up: metric.id === "delayed" || metric.id === "return_rate" ? "text-red-600" : "text-green-600",
		down:
			metric.id === "delayed" || metric.id === "return_rate" ? "text-green-600" : "text-red-600",
		neutral: "text-gray-500",
	}[metric.trend];

	const trendPrefix = metric.trend === "up" ? "▲" : metric.trend === "down" ? "▼" : "—";

	return (
		<Card>
			<p className="text-sm font-medium text-gray-500">{metric.label}</p>
			<p className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">{metric.formattedValue}</p>
			<p className={cn("mt-1 text-xs font-medium", trendColor)}>
				{trendPrefix} {metric.description}
			</p>
		</Card>
	);
});
