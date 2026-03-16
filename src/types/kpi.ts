export type KpiTrend = "up" | "down" | "neutral";

export interface KpiMetric {
	id: string;
	label: string;
	value: number;
	formattedValue: string;
	changeRate: number;
	trend: KpiTrend;
	unit: string;
	description: string;
}
