/**
 * 원격 Supabase products 테이블에 더미 데이터를 삽입하는 스크립트
 *
 * 사전 준비:
 *   .env.local에 SUPABASE_SERVICE_ROLE_KEY=<service_role 키> 추가
 *   (Supabase 대시보드 > Project Settings > API > service_role)
 *
 * 실행:
 *   pnpm seed:products
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateProducts } from "../src/constants/dummyData";

// .env.local 파싱
try {
	const env = readFileSync(".env.local", "utf-8");
	for (const line of env.split("\n")) {
		const match = line.match(/^([^=]+)=(.*)$/);
		if (match) process.env[match[1].trim()] = match[2].trim();
	}
} catch {
	/* 파일 없으면 무시 */
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BATCH_SIZE = 500;
const PRODUCT_COUNT = 500;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error("❌ 환경변수 누락: VITE_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
	auth: { persistSession: false },
});

console.log(`📦 ${PRODUCT_COUNT}건 상품 데이터 생성 중...`);
const products = generateProducts(PRODUCT_COUNT);

// 기존 데이터 삭제
console.log("🗑️  기존 products 데이터 삭제 중...");
const { error: deleteError } = await supabase
	.from("products")
	.delete()
	.neq("id", "00000000-0000-0000-0000-000000000000");

if (deleteError) {
	console.warn("⚠️  삭제 실패 (테이블이 비어있을 수 있음):", deleteError.message);
}

// 배치 단위로 삽입
const totalBatches = Math.ceil(products.length / BATCH_SIZE);

for (let i = 0; i < products.length; i += BATCH_SIZE) {
	const batchNum = Math.floor(i / BATCH_SIZE) + 1;
	const batch = products.slice(i, i + BATCH_SIZE).map((p) => ({
		sku: p.sku,
		name: p.name,
		category: p.category,
		unit_price: p.unitPrice,
		stock: p.stock,
		sales_count: p.salesCount,
		status: p.status,
		created_at: p.createdAt,
		updated_at: p.updatedAt,
	}));

	const { error } = await supabase.from("products").insert(batch);

	if (error) {
		console.error(`❌ 배치 ${batchNum}/${totalBatches} 실패:`, error.message);
		process.exit(1);
	}

	const inserted = Math.min(i + BATCH_SIZE, products.length);
	process.stdout.write(
		`\r✅ ${inserted} / ${products.length}건 삽입 (배치 ${batchNum}/${totalBatches})`,
	);
}

console.log("\n🎉 상품 시드 데이터 삽입 완료!");
console.log("   이제 /products 페이지에서 실제 데이터를 확인할 수 있습니다.");
