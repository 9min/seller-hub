import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOrderStatus } from "@/services/orderService";
import { useToastStore } from "@/stores/toastStore";
import type { OrderStatus } from "@/types/order";

export function useUpdateOrderStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
			updateOrderStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			useToastStore.getState().addToast({
				message: "주문 상태가 변경되었습니다.",
				type: "success",
				duration: 3000,
			});
		},
		onError: (error) => {
			useToastStore.getState().addToast({
				message: error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
				type: "error",
				duration: 5000,
			});
		},
	});
}
