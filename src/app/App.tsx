import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { useAuthStore } from "@/stores/authStore";

export function App() {
	const initialize = useAuthStore((s) => s.initialize);

	useEffect(() => {
		const cleanup = initialize();
		return cleanup;
	}, [initialize]);

	return (
		<ErrorBoundary>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/" element={<DashboardPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/products" element={<ProductsPage />} />
					<Route path="/analytics" element={<AnalyticsPage />} />
				</Route>
			</Routes>
		</ErrorBoundary>
	);
}
