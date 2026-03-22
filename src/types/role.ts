export type UserRole = "admin" | "seller" | "viewer";

type Action = "read" | "create" | "update" | "delete" | "export";
type Resource = "orders" | "products" | "analytics";

const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
	admin: {
		orders: ["read", "update", "export"],
		products: ["read", "create", "update", "delete", "export"],
		analytics: ["read", "export"],
	},
	seller: {
		orders: ["read", "update", "export"],
		products: ["read", "create", "update", "delete", "export"],
		analytics: ["read", "export"],
	},
	viewer: {
		orders: ["read"],
		products: ["read"],
		analytics: ["read"],
	},
};

export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
	return ROLE_PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
}
