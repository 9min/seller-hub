import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/types/role";

/**
 * 현재 사용자의 역할에 따른 리소스별 권한을 확인한다.
 */
export function usePermission(
	resource: "orders" | "products" | "analytics",
	action: "read" | "create" | "update" | "delete" | "export",
) {
	const role = useAuthStore((s) => s.role);
	return hasPermission(role, resource, action);
}
