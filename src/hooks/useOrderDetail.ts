import { useQuery } from "@tanstack/react-query";

import { fetchOrderById } from "@/services/orderService";

export function useOrderDetail(id: string) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["orders", "detail", id],
		queryFn: () => fetchOrderById(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});

	return { order: data ?? null, isLoading, error };
}
