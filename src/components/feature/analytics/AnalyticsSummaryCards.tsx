import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AnalyticsSummary } from "@/types/analytics";
import { formatCount } from "@/utils/formatNumber";

interface AnalyticsSummaryCardsProps {
	summary: AnalyticsSummary | undefined;
	isLoading?: boolean;
}

interface SummaryItem {
	label: string;
	value: string;
	sub: string;
	trendColor: string;
}

export function AnalyticsSummaryCards({ summary, isLoading }: AnalyticsSummaryCardsProps) {
	if (isLoading || !summary) {
		return (
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: 스켈레톤 렌더링용 인덱스
					<Skeleton key={i} className="h-28" />
				))}
			</div>
		);
	}

	const growthSign = summary.revenueGrowthRate >= 0 ? "+" : "";
	const trendColor =
		summary.trend === "up"
			? "text-emerald-600"
			: summary.trend === "down"
				? "text-red-500"
				: "text-gray-500";

	const items: SummaryItem[] = [
		{
			label: "총 매출",
			value: summary.formattedTotalRevenue,
			sub: `전기간 대비 ${growthSign}${summary.revenueGrowthRate}%`,
			trendColor,
		},
		{
			label: "총 주문",
			value: `${formatCount(summary.totalOrders)}건`,
			sub: "취소/반품 제외",
			trendColor: "text-gray-500",
		},
		{
			label: "평균 단가",
			value: summary.formattedAvgUnitPrice,
			sub: "주문당 평균",
			trendColor: "text-gray-500",
		},
		{
			label: "매출 성장률",
			value: `${growthSign}${summary.revenueGrowthRate}%`,
			sub: "전기간 대비",
			trendColor,
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{items.map((item) => (
				<Card key={item.label} className="p-4">
					<p className="text-xs font-medium text-gray-500">{item.label}</p>
					<p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
					<p className={`mt-1 text-xs ${item.trendColor}`}>{item.sub}</p>
				</Card>
			))}
		</div>
	);
}
