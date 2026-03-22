import { useSearchParams } from "react-router-dom";
import { AnalyticsCategoryChart } from "@/components/feature/analytics/AnalyticsCategoryChart";
import { AnalyticsSummaryCards } from "@/components/feature/analytics/AnalyticsSummaryCards";
import { AnalyticsTopProductsTable } from "@/components/feature/analytics/AnalyticsTopProductsTable";
import { AnalyticsTrendChart } from "@/components/feature/analytics/AnalyticsTrendChart";
import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { TabGroup } from "@/components/ui/TabGroup";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import type { AnalyticsPeriod } from "@/types/analytics";

const ALLOWED_PERIODS: AnalyticsPeriod[] = [7, 30, 90, "custom"];

const PERIOD_TABS: { value: AnalyticsPeriod; label: string }[] = [
	{ value: 7, label: "7일" },
	{ value: 30, label: "30일" },
	{ value: 90, label: "90일" },
	{ value: "custom", label: "커스텀" },
];

function calcDaysBetween(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
	return Math.max(1, diff);
}

export function AnalyticsPage() {
	const [searchParams, setSearchParams] = useSearchParams();

	const daysRaw = searchParams.get("days") ?? "30";
	const period: AnalyticsPeriod =
		daysRaw === "custom"
			? "custom"
			: ALLOWED_PERIODS.includes(Number(daysRaw) as AnalyticsPeriod)
				? (Number(daysRaw) as AnalyticsPeriod)
				: 30;

	const startDate = searchParams.get("startDate") ?? "";
	const endDate = searchParams.get("endDate") ?? "";
	const customDays = startDate && endDate ? calcDaysBetween(startDate, endDate) : undefined;

	const { summary, trend, category, topProducts } = useAnalyticsData(period, customDays);

	function handlePeriodChange(value: AnalyticsPeriod) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("days", String(value));
			if (value !== "custom") {
				next.delete("startDate");
				next.delete("endDate");
			}
			return next;
		});
	}

	function handleStartDateChange(date: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("days", "custom");
			if (date) next.set("startDate", date);
			else next.delete("startDate");
			return next;
		});
	}

	function handleEndDateChange(date: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("days", "custom");
			if (date) next.set("endDate", date);
			else next.delete("endDate");
			return next;
		});
	}

	return (
		<AppLayout title="매출 분석">
			{/* 기간 선택 */}
			<div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
				{period === "custom" && (
					<DateRangePicker
						startDate={startDate}
						endDate={endDate}
						onStartDateChange={handleStartDateChange}
						onEndDateChange={handleEndDateChange}
					/>
				)}
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
