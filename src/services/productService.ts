import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type {
	CreateProductInput,
	Product,
	ProductStatus,
	UpdateProductInput,
} from "@/types/product";

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

export async function createProduct(input: CreateProductInput): Promise<Product> {
	const { data, error } = await supabase
		.from("products")
		.insert({
			sku: input.sku,
			name: input.name,
			category: input.category,
			unit_price: input.unitPrice,
			stock: input.stock,
			status: input.status,
		})
		.select()
		.single();

	if (error) throw error;
	return rowToProduct(data);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
	const updateData: Record<string, unknown> = {};
	if (input.sku !== undefined) updateData.sku = input.sku;
	if (input.name !== undefined) updateData.name = input.name;
	if (input.category !== undefined) updateData.category = input.category;
	if (input.unitPrice !== undefined) updateData.unit_price = input.unitPrice;
	if (input.stock !== undefined) updateData.stock = input.stock;
	if (input.status !== undefined) updateData.status = input.status;

	const { data, error } = await supabase
		.from("products")
		.update(updateData)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return rowToProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
	const { error } = await supabase.from("products").delete().eq("id", id);
	if (error) throw error;
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
