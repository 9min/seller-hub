import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { generateProducts } from "@/constants/dummyData";
import type { FetchProductsParams } from "@/services/productService";
import { fetchProducts } from "@/services/productService";
import type { Product, ProductStatus } from "@/types/product";

const PAGE_SIZE = 50;
const FALLBACK_PRODUCTS = generateProducts(500);

let dbEmpty = false;

/** @internal 테스트 전용: dbEmpty 상태 초기화 */
export function __resetDbEmpty() {
	dbEmpty = false;
}

function getFallbackPage(params: FetchProductsParams) {
	const {
		page,
		pageSize = PAGE_SIZE,
		searchQuery,
		categories,
		statuses,
		sortBy,
		sortOrder,
	} = params;

	let filtered = FALLBACK_PRODUCTS;

	if (searchQuery?.trim()) {
		const q = searchQuery.trim().toLowerCase();
		filtered = filtered.filter(
			(p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
		);
	}

	if (categories && categories.length > 0) {
		filtered = filtered.filter((p) => categories.includes(p.category));
	}

	if (statuses && statuses.length > 0) {
		filtered = filtered.filter((p) => statuses.includes(p.status as ProductStatus));
	}

	filtered = [...filtered].sort((a, b) => {
		let aVal: string | number;
		let bVal: string | number;

		if (sortBy === "unitPrice") {
			aVal = a.unitPrice;
			bVal = b.unitPrice;
		} else if (sortBy === "stock") {
			aVal = a.stock;
			bVal = b.stock;
		} else if (sortBy === "salesCount") {
			aVal = a.salesCount;
			bVal = b.salesCount;
		} else {
			aVal = a.name;
			bVal = b.name;
		}

		if (aVal < bVal) return sortOrder === "desc" ? 1 : -1;
		if (aVal > bVal) return sortOrder === "desc" ? -1 : 1;
		return 0;
	});

	return {
		products: filtered.slice(page * pageSize, (page + 1) * pageSize),
		total: filtered.length,
	};
}

export function useProductsData(params: FetchProductsParams): {
	products: Product[];
	total: number;
	isLoading: boolean;
	isFetching: boolean;
} {
	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["products", params],
		queryFn: async () => {
			if (dbEmpty) return getFallbackPage(params);

			try {
				const result = await fetchProducts(params);
				if (result.total === 0 && params.page === 0) {
					dbEmpty = true;
					return getFallbackPage(params);
				}
				return result;
			} catch {
				if (params.page === 0) dbEmpty = true;
				return getFallbackPage(params);
			}
		},
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
	});

	return {
		products: data?.products ?? [],
		total: data?.total ?? 0,
		isLoading,
		isFetching,
	};
}
