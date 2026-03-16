import { DashboardContent } from "@/components/feature/dashboard/DashboardContent";
import { AppLayout } from "@/components/layout/AppLayout";

export function DashboardPage() {
	return (
		<AppLayout title="대시보드">
			<DashboardContent />
		</AppLayout>
	);
}
