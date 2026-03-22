import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import type { CreateProductInput, Product, ProductStatus } from "@/types/product";

interface ProductFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateProductInput) => void;
	product?: Product | null;
	isPending?: boolean;
}

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
	{ value: "ACTIVE", label: "판매중" },
	{ value: "SOLD_OUT", label: "품절" },
	{ value: "HIDDEN", label: "숨김" },
];

export function ProductFormModal({
	isOpen,
	onClose,
	onSubmit,
	product,
	isPending,
}: ProductFormModalProps) {
	const isEdit = !!product;

	const [sku, setSku] = useState("");
	const [name, setName] = useState("");
	const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
	const [unitPrice, setUnitPrice] = useState("");
	const [stock, setStock] = useState("");
	const [status, setStatus] = useState<ProductStatus>("ACTIVE");

	useEffect(() => {
		if (product) {
			setSku(product.sku);
			setName(product.name);
			setCategory(product.category);
			setUnitPrice(String(product.unitPrice));
			setStock(String(product.stock));
			setStatus(product.status);
		} else {
			setSku("");
			setName("");
			setCategory(PRODUCT_CATEGORIES[0]);
			setUnitPrice("");
			setStock("");
			setStatus("ACTIVE");
		}
	}, [product]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit({
			sku,
			name,
			category,
			unitPrice: Number(unitPrice),
			stock: Number(stock),
			status,
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "상품 수정" : "상품 등록"}>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<Input
					id="sku"
					label="SKU"
					value={sku}
					onChange={(e) => setSku(e.target.value)}
					required
					disabled={isPending}
				/>
				<Input
					id="name"
					label="상품명"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					disabled={isPending}
				/>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="category" className="text-sm font-medium text-gray-700">
						카테고리
					</label>
					<select
						id="category"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
						disabled={isPending}
					>
						{PRODUCT_CATEGORIES.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</div>

				<Input
					id="unitPrice"
					label="단가 (원)"
					type="number"
					min="0"
					value={unitPrice}
					onChange={(e) => setUnitPrice(e.target.value)}
					required
					disabled={isPending}
				/>
				<Input
					id="stock"
					label="재고"
					type="number"
					min="0"
					value={stock}
					onChange={(e) => setStock(e.target.value)}
					required
					disabled={isPending}
				/>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="status" className="text-sm font-medium text-gray-700">
						상태
					</label>
					<select
						id="status"
						value={status}
						onChange={(e) => setStatus(e.target.value as ProductStatus)}
						className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
						disabled={isPending}
					>
						{PRODUCT_STATUSES.map((s) => (
							<option key={s.value} value={s.value}>
								{s.label}
							</option>
						))}
					</select>
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
						취소
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "저장 중..." : isEdit ? "수정" : "등록"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
