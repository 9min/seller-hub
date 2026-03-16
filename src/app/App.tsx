import { Route, Routes } from "react-router-dom";

import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductsPage } from "@/pages/ProductsPage";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<DashboardPage />} />
			<Route path="/orders" element={<OrdersPage />} />
			<Route path="/products" element={<ProductsPage />} />
			<Route path="/analytics" element={<AnalyticsPage />} />
		</Routes>
	);
}
