import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Product, ProductStatus } from "@/types/product";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

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

function rowToProduct(row: ProductRow): Product {
	return {
		id: row.id,
		sku: row.sku,
		name: row.name,
		category: row.category,
		unitPrice: row.unit_price,
		stock: row.stock,
		salesCount: row.sales_count,
		status: row.status as ProductStatus,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
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
		// PostgREST 메타문자 이스케이프 (쉼표, 마침표, 괄호 등)
		const q = searchQuery.trim().replace(/[,%.()"\\]/g, "");
		if (q) {
			query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
		}
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
		products: (data ?? []).map(rowToProduct),
		total: count ?? 0,
	};
}
