/**
 * 특정 seller에게 주문/상품 시드 데이터를 생성하는 스크립트
 *
 * 사용법:
 *   SELLER_ID=<uuid> tsx --env-file .env.local scripts/seedForSeller.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateOrders, generateProducts } from "../src/constants/dummyData";

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
const SELLER_ID = process.env.SELLER_ID ?? "";
const ORDER_COUNT = 10_000;
const PRODUCT_COUNT = 200;
const BATCH_SIZE = 1_000;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SELLER_ID) {
	console.error("❌ 환경변수 누락: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SELLER_ID");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
	auth: { persistSession: false },
});

// 주문 데이터 생성
console.log(`📦 주문 ${ORDER_COUNT.toLocaleString()}건 생성 중...`);
const orders = generateOrders(ORDER_COUNT);
const totalBatches = Math.ceil(orders.length / BATCH_SIZE);

for (let i = 0; i < orders.length; i += BATCH_SIZE) {
	const batchNum = Math.floor(i / BATCH_SIZE) + 1;
	const batch = orders.slice(i, i + BATCH_SIZE).map((o) => ({
		order_number: `B-${o.orderNumber}`,
		buyer_name: o.buyerName,
		product_name: o.productName,
		category: o.category,
		quantity: o.quantity,
		unit_price: o.unitPrice,
		total_price: o.totalPrice,
		status: o.status,
		ordered_at: o.orderedAt,
		shipped_at: o.shippedAt,
		delivered_at: o.deliveredAt,
		is_delayed: o.isDelayed,
		seller_id: SELLER_ID,
	}));

	const { error } = await supabase.from("orders").insert(batch);
	if (error) {
		console.error(`❌ 주문 배치 ${batchNum}/${totalBatches} 실패:`, error.message);
		process.exit(1);
	}

	const inserted = Math.min(i + BATCH_SIZE, orders.length);
	process.stdout.write(
		`\r✅ 주문 ${inserted.toLocaleString()} / ${orders.length.toLocaleString()}건`,
	);
}

console.log("");

// 상품 데이터 생성
console.log(`🛍️  상품 ${PRODUCT_COUNT}건 생성 중...`);
const products = generateProducts(PRODUCT_COUNT);
const productBatch = products.map((p) => ({
	sku: `S2-${p.sku}`,
	name: p.name,
	category: p.category,
	unit_price: p.unitPrice,
	stock: p.stock,
	sales_count: p.salesCount,
	status: p.status,
	seller_id: SELLER_ID,
}));

const { error: prodError } = await supabase.from("products").insert(productBatch);
if (prodError) {
	console.error("❌ 상품 삽입 실패:", prodError.message);
	process.exit(1);
}

console.log(`✅ 상품 ${PRODUCT_COUNT}건 완료`);
console.log("🎉 시드 데이터 삽입 완료!");
