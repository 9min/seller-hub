import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProduct, deleteProduct, updateProduct } from "@/services/productService";
import { useToastStore } from "@/stores/toastStore";
import type { CreateProductInput, UpdateProductInput } from "@/types/product";

export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateProductInput) => createProduct(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			useToastStore.getState().addToast({
				message: "상품이 등록되었습니다.",
				type: "success",
				duration: 3000,
			});
		},
		onError: (error) => {
			useToastStore.getState().addToast({
				message: error instanceof Error ? error.message : "상품 등록에 실패했습니다.",
				type: "error",
				duration: 5000,
			});
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => updateProduct(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			useToastStore.getState().addToast({
				message: "상품이 수정되었습니다.",
				type: "success",
				duration: 3000,
			});
		},
		onError: (error) => {
			useToastStore.getState().addToast({
				message: error instanceof Error ? error.message : "상품 수정에 실패했습니다.",
				type: "error",
				duration: 5000,
			});
		},
	});
}

export function useDeleteProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			useToastStore.getState().addToast({
				message: "상품이 삭제되었습니다.",
				type: "success",
				duration: 3000,
			});
		},
		onError: (error) => {
			useToastStore.getState().addToast({
				message: error instanceof Error ? error.message : "상품 삭제에 실패했습니다.",
				type: "error",
				duration: 5000,
			});
		},
	});
}
