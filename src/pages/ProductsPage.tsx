import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductFormModal } from "@/components/feature/products/ProductFormModal";
import { ProductsFilterBar } from "@/components/feature/products/ProductsFilterBar";
import { ProductsTable } from "@/components/feature/products/ProductsTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import { PRODUCT_STATUS_LABEL } from "@/constants/productStatus";
import { useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/useProductMutations";
import { useProductsData } from "@/hooks/useProductsData";
import type { FetchProductsParams, ProductSortableColumn } from "@/services/productService";
import type { CreateProductInput, Product, ProductStatus } from "@/types/product";
import { exportToCSV } from "@/utils/csvExport";

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

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const createMutation = useCreateProduct();
	const updateMutation = useUpdateProduct();
	const deleteMutation = useDeleteProduct();

	function setParam(key: string, value: string) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) next.set(key, value);
			else next.delete(key);
			return next;
		});
	}

	const handleSearchChange = useCallback(
		(q: string) => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				if (q) next.set("q", q);
				else next.delete("q");
				next.delete("page");
				return next;
			});
		},
		[setSearchParams],
	);

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

	function handleFormSubmit(data: CreateProductInput) {
		if (editingProduct) {
			updateMutation.mutate({ id: editingProduct.id, data }, { onSuccess: () => closeForm() });
		} else {
			createMutation.mutate(data, { onSuccess: () => closeForm() });
		}
	}

	function handleEdit(product: Product) {
		setEditingProduct(product);
		setIsFormOpen(true);
	}

	function handleDelete(product: Product) {
		if (window.confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
			deleteMutation.mutate(product.id);
		}
	}

	function closeForm() {
		setIsFormOpen(false);
		setEditingProduct(null);
	}

	return (
		<AppLayout title="상품 관리">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
				<ProductsFilterBar
					categories={params.categories ?? []}
					statuses={params.statuses ?? []}
					onCategoriesChange={handleCategoriesChange}
					onStatusesChange={handleStatusesChange}
					onReset={handleReset}
				/>
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() =>
							exportToCSV(products, `products_${new Date().toISOString().split("T")[0]}`, [
								{ key: "sku", header: "SKU" },
								{ key: "name", header: "상품명" },
								{ key: "category", header: "카테고리" },
								{ key: "unitPrice", header: "단가" },
								{ key: "stock", header: "재고" },
								{ key: "salesCount", header: "판매량" },
								{ key: "status", header: "상태" },
							])
						}
						disabled={products.length === 0}
					>
						CSV 다운로드
					</Button>
					<Button size="sm" onClick={() => setIsFormOpen(true)}>
						상품 등록
					</Button>
				</div>
			</div>
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
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
			<ProductFormModal
				isOpen={isFormOpen}
				onClose={closeForm}
				onSubmit={handleFormSubmit}
				product={editingProduct}
				isPending={createMutation.isPending || updateMutation.isPending}
			/>
		</AppLayout>
	);
}
