import { Skeleton } from "@/components/ui/Skeleton";
import type { KpiMetric } from "@/types/kpi";
import { KpiCard } from "./KpiCard";

const SKELETON_KEYS = ["revenue", "orders", "delayed", "returns"] as const;

interface KpiSectionProps {
	metrics: KpiMetric[] | undefined;
	isLoading: boolean;
}

export function KpiSection({ metrics, isLoading }: KpiSectionProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{SKELETON_KEYS.map((id) => (
					<Skeleton key={id} className="h-28" />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{metrics?.map((metric) => (
				<KpiCard key={metric.id} metric={metric} />
			))}
		</div>
	);
}
