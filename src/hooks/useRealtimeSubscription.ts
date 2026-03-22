import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

/**
 * Supabase Realtime으로 orders/products 테이블 변경사항을 구독하고
 * 토스트 알림 + TanStack Query 캐시 무효화를 수행한다.
 */
export function useRealtimeSubscription() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!isAuthenticated) return;

		const channel = supabase
			.channel("db-changes")
			.on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
				useToastStore.getState().addToast({
					message: "새 주문이 접수되었습니다.",
					type: "info",
					duration: 4000,
				});
				queryClient.invalidateQueries({ queryKey: ["orders"] });
			})
			.on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
				queryClient.invalidateQueries({ queryKey: ["orders"] });
			})
			.on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, () => {
				useToastStore.getState().addToast({
					message: "새 상품이 등록되었습니다.",
					type: "info",
					duration: 4000,
				});
				queryClient.invalidateQueries({ queryKey: ["products"] });
			})
			.on("postgres_changes", { event: "UPDATE", schema: "public", table: "products" }, () => {
				queryClient.invalidateQueries({ queryKey: ["products"] });
			})
			.on("postgres_changes", { event: "DELETE", schema: "public", table: "products" }, () => {
				queryClient.invalidateQueries({ queryKey: ["products"] });
			})
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [isAuthenticated, queryClient]);
}
