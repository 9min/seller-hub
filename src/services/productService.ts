import { supabase } from "@/lib/supabase";
import type { Product, ProductStatus } from "@/types/product";

export type ProductSortableColumn = "name" | "unitPrice" | "stock" | "salesCount";

const SORT_COLUMN_MAP: Record<ProductSortableColumn, string> = {
	name: "name",
	unitPrice: "unit_price",
	stock: "stock",
	salesCount: "sales_count",
};

export interface FetchProductsParams {
	page: number;
	pageSize: number;
	searchQuery?: string;
	categories?: string[];
	statuses?: ProductStatus[];
	sortBy?: ProductSortableColumn;
	sortOrder?: "asc" | "desc";
}

export interface FetchProductsResult {
	products: Product[];
	total: number;
}

function rowToProduct(row: Record<string, unknown>): Product {
	return {
		id: row.id as string,
		sku: row.sku as string,
		name: row.name as string,
		category: row.category as string,
		unitPrice: row.unit_price as number,
		stock: row.stock as number,
		salesCount: row.sales_count as number,
		status: row.status as ProductStatus,
		createdAt: row.created_at as string,
		updatedAt: row.updated_at as string,
	};
}

export async function fetchProducts(params: FetchProductsParams): Promise<FetchProductsResult> {
	const { page, pageSize, searchQuery, categories, statuses, sortBy, sortOrder } = params;

	const sortColumn = sortBy ? (SORT_COLUMN_MAP[sortBy] ?? "name") : "name";
	const ascending = sortOrder !== "desc";

	let query = supabase
		.from("products")
		.select("*", { count: "exact" })
		.order(sortColumn, { ascending });

	if (searchQuery?.trim()) {
		const q = searchQuery.trim();
		query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
	}

	if (categories && categories.length > 0) {
		query = query.in("category", categories);
	}

	if (statuses && statuses.length > 0) {
		query = query.in("status", statuses);
	}

	const { data, error, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
	if (error) {
		if (error.code === "PGRST103") {
			return { products: [], total: 0 };
		}
		throw error;
	}

	return {
		products: ((data ?? []) as Record<string, unknown>[]).map(rowToProduct),
		total: count ?? 0,
	};
}
