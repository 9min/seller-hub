import { useSearchParams } from "react-router-dom";
import { ProductsFilterBar } from "@/components/feature/products/ProductsFilterBar";
import { ProductsTable } from "@/components/feature/products/ProductsTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import { PRODUCT_STATUS_LABEL } from "@/constants/productStatus";
import { useProductsData } from "@/hooks/useProductsData";
import type { FetchProductsParams, ProductSortableColumn } from "@/services/productService";
import type { ProductStatus } from "@/types/product";

const PAGE_SIZE = 50;

const ALLOWED_SORT_BY: ProductSortableColumn[] = ["name", "unitPrice", "stock", "salesCount"];
const ALLOWED_STATUSES = Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[];

function parseProductsSearchParams(searchParams: URLSearchParams): FetchProductsParams {
	const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);
	const searchQuery = searchParams.get("q") ?? "";

	const categoriesRaw = searchParams.get("categories") ?? "";
	const categories = categoriesRaw
		? categoriesRaw.split(",").filter((c) => (PRODUCT_CATEGORIES as readonly string[]).includes(c))
		: [];

	const statusesRaw = searchParams.get("statuses") ?? "";
	const statuses = statusesRaw
		? (statusesRaw
				.split(",")
				.filter((s) => ALLOWED_STATUSES.includes(s as ProductStatus)) as ProductStatus[])
		: [];

	const sortByRaw = searchParams.get("sortBy") ?? "name";
	const sortBy: ProductSortableColumn = ALLOWED_SORT_BY.includes(sortByRaw as ProductSortableColumn)
		? (sortByRaw as ProductSortableColumn)
		: "name";

	const sortOrderRaw = searchParams.get("sortOrder") ?? "asc";
	const sortOrder: "asc" | "desc" = sortOrderRaw === "desc" ? "desc" : "asc";

	return { page, pageSize: PAGE_SIZE, searchQuery, categories, statuses, sortBy, sortOrder };
}

export function ProductsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const params = parseProductsSearchParams(searchParams);
	const { products, total, isLoading, isFetching } = useProductsData(params);

	function setParam(key: string, value: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) next.set(key, value);
			else next.delete(key);
			return next;
		});
	}

	function handleSearchChange(q: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (q) next.set("q", q);
			else next.delete("q");
			next.delete("page");
			return next;
		});
	}

	function handlePageChange(page: number) {
		setParam("page", page === 0 ? "" : String(page));
	}

	function handleCategoriesChange(categories: string[]) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (categories.length > 0) next.set("categories", categories.join(","));
			else next.delete("categories");
			next.delete("page");
			return next;
		});
	}

	function handleStatusesChange(statuses: ProductStatus[]) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (statuses.length > 0) next.set("statuses", statuses.join(","));
			else next.delete("statuses");
			next.delete("page");
			return next;
		});
	}

	function handleSortChange(sortBy: string, sortOrder: "asc" | "desc") {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("sortBy", sortBy);
			next.set("sortOrder", sortOrder);
			next.delete("page");
			return next;
		});
	}

	function handleReset() {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.delete("categories");
			next.delete("statuses");
			next.delete("page");
			return next;
		});
	}

	return (
		<AppLayout title="상품 관리">
			<ProductsFilterBar
				categories={params.categories ?? []}
				statuses={params.statuses ?? []}
				onCategoriesChange={handleCategoriesChange}
				onStatusesChange={handleStatusesChange}
				onReset={handleReset}
			/>
			<ProductsTable
				products={products}
				total={total}
				page={params.page}
				pageSize={PAGE_SIZE}
				searchQuery={params.searchQuery ?? ""}
				onSearchChange={handleSearchChange}
				onPageChange={handlePageChange}
				sortBy={params.sortBy}
				sortOrder={params.sortOrder}
				onSortChange={handleSortChange}
				isLoading={isLoading}
				isFetching={isFetching}
			/>
		</AppLayout>
	);
}
