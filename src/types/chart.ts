export type ChartPeriod = "daily" | "weekly" | "monthly";

export interface SalesDataPoint {
	label: string;
	revenue: number;
}

export interface CategoryDataPoint {
	name: string;
	value: number;
	color: string;
}
