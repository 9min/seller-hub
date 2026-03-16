/**
 * 원격 Supabase에 시드 데이터를 삽입하는 스크립트
 *
 * 실행 전 환경변수 설정:
 *   SUPABASE_SERVICE_ROLE_KEY=<Supabase 대시보드 > Project Settings > API > service_role 키>
 *
 * 실행:
 *   pnpm seed:remote
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateOrders } from "../src/constants/dummyData";

// Node 20.12+ --env-file 미지원 환경을 위한 수동 .env.local 파싱
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
const BATCH_SIZE = 1_000;
const ORDER_COUNT = 50_000;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error("❌ 환경변수 누락: VITE_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY");
	console.error(
		"   .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하거나 환경변수로 직접 전달하세요.",
	);
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
	auth: { persistSession: false },
});

console.log(`📦 ${ORDER_COUNT.toLocaleString()}건 주문 데이터 생성 중...`);
const orders = generateOrders(ORDER_COUNT);

// 기존 데이터 삭제
console.log("🗑️  기존 orders 데이터 삭제 중...");
const { error: deleteError } = await supabase
	.from("orders")
	.delete()
	.neq("id", "00000000-0000-0000-0000-000000000000"); // 전체 삭제 (RLS bypass)

if (deleteError) {
	console.warn("⚠️  삭제 실패 (테이블이 비어있을 수 있음):", deleteError.message);
}

// 배치 단위로 삽입
const totalBatches = Math.ceil(orders.length / BATCH_SIZE);

for (let i = 0; i < orders.length; i += BATCH_SIZE) {
	const batchNum = Math.floor(i / BATCH_SIZE) + 1;
	const batch = orders.slice(i, i + BATCH_SIZE).map((o) => ({
		// id는 DB가 UUID 자동 생성 (o.id는 'order-1' 형식이라 UUID 타입 불일치)
		order_number: o.orderNumber,
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
	}));

	const { error } = await supabase.from("orders").insert(batch);

	if (error) {
		console.error(`❌ 배치 ${batchNum}/${totalBatches} 실패:`, error.message);
		process.exit(1);
	}

	const inserted = Math.min(i + BATCH_SIZE, orders.length);
	const pct = ((inserted / orders.length) * 100).toFixed(0);
	process.stdout.write(
		`\r✅ ${inserted.toLocaleString()} / ${orders.length.toLocaleString()}건 삽입 (${pct}%) [배치 ${batchNum}/${totalBatches}]`,
	);
}

console.log("\n🎉 시드 데이터 삽입 완료!");
