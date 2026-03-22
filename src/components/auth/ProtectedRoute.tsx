import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuthStore();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-gray-500">인증 확인 중...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
