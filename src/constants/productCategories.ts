export const PRODUCT_CATEGORIES = [
	"패션의류",
	"전자기기",
	"뷰티",
	"스포츠",
	"홈리빙",
	"식품",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
