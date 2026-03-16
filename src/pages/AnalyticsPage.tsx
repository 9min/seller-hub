import { useSearchParams } from "react-router-dom";
import { AnalyticsCategoryChart } from "@/components/feature/analytics/AnalyticsCategoryChart";
import { AnalyticsSummaryCards } from "@/components/feature/analytics/AnalyticsSummaryCards";
import { AnalyticsTopProductsTable } from "@/components/feature/analytics/AnalyticsTopProductsTable";
import { AnalyticsTrendChart } from "@/components/feature/analytics/AnalyticsTrendChart";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabGroup } from "@/components/ui/TabGroup";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import type { AnalyticsPeriod } from "@/types/analytics";

const ALLOWED_PERIODS: AnalyticsPeriod[] = [7, 30, 90];

const PERIOD_TABS: { value: AnalyticsPeriod; label: string }[] = [
	{ value: 7, label: "7일" },
	{ value: 30, label: "30일" },
	{ value: 90, label: "90일" },
];

export function AnalyticsPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const daysRaw = Number(searchParams.get("days") ?? "30");
	const period: AnalyticsPeriod = ALLOWED_PERIODS.includes(daysRaw as AnalyticsPeriod)
		? (daysRaw as AnalyticsPeriod)
		: 30;

	const { summary, trend, category, topProducts } = useAnalyticsData(period);

	function handlePeriodChange(value: AnalyticsPeriod) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("days", String(value));
			return next;
		});
	}

	return (
		<AppLayout title="매출 분석">
			{/* 기간 선택 */}
			<div className="mb-4 flex justify-end">
				<TabGroup items={PERIOD_TABS} value={period} onChange={handlePeriodChange} />
			</div>

			{/* 요약 카드 */}
			<AnalyticsSummaryCards summary={summary.data} isLoading={summary.isLoading} />

			{/* 매출 추이 차트 */}
			<div className="mt-4">
				<AnalyticsTrendChart trendData={trend.data} isLoading={trend.isLoading} />
			</div>

			{/* 카테고리 차트 + 상품 순위 */}
			<div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<AnalyticsCategoryChart categoryData={category.data} isLoading={category.isLoading} />
				<AnalyticsTopProductsTable
					topProducts={topProducts.data}
					isLoading={topProducts.isLoading}
				/>
			</div>
		</AppLayout>
	);
}
