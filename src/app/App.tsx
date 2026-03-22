import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useAuthStore } from "@/stores/authStore";

const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
	import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const OrdersPage = lazy(() =>
	import("@/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const ProductsPage = lazy(() =>
	import("@/pages/ProductsPage").then((m) => ({ default: m.ProductsPage })),
);
const AnalyticsPage = lazy(() =>
	import("@/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const OrderDetailPage = lazy(() =>
	import("@/pages/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })),
);

function PageLoader() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="text-gray-500">페이지 로딩 중...</div>
		</div>
	);
}

export function App() {
	const initialize = useAuthStore((s) => s.initialize);

	useEffect(() => {
		const cleanup = initialize();
		return cleanup;
	}, [initialize]);

	return (
		<ErrorBoundary>
			<ToastContainer />
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/orders" element={<OrdersPage />} />
						<Route path="/orders/:id" element={<OrderDetailPage />} />
						<Route path="/products" element={<ProductsPage />} />
						<Route path="/analytics" element={<AnalyticsPage />} />
					</Route>
				</Routes>
			</Suspense>
		</ErrorBoundary>
	);
}
