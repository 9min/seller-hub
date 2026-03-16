/**
 * 시드 SQL 생성 스크립트
 * 실행: pnpm generate:seed
 * 출력: supabase/seed.sql (50,000건 INSERT)
 */
import { generateOrders } from "../src/constants/dummyData";

const orders = generateOrders(50_000);

const escapeStr = (s: string) => s.replace(/'/g, "''");

let sql = "-- 자동 생성된 시드 데이터 (50,000건)\n";
sql += "TRUNCATE TABLE orders RESTART IDENTITY CASCADE;\n";
sql +=
	"INSERT INTO orders (order_number, buyer_name, product_name, category, quantity, unit_price, total_price, status, ordered_at, shipped_at, delivered_at, is_delayed) VALUES\n";

const values = orders.map((o) => {
	const shippedAt = o.shippedAt ? `'${o.shippedAt}'` : "NULL";
	const deliveredAt = o.deliveredAt ? `'${o.deliveredAt}'` : "NULL";
	const isDelayed = o.isDelayed ? "TRUE" : "FALSE";
	return `('${escapeStr(o.orderNumber)}', '${escapeStr(o.buyerName)}', '${escapeStr(o.productName)}', '${escapeStr(o.category)}', ${o.quantity}, ${o.unitPrice}, ${o.totalPrice}, '${o.status}', '${o.orderedAt}', ${shippedAt}, ${deliveredAt}, ${isDelayed})`;
});

sql += `${values.join(",\n")};\n`;

process.stdout.write(sql);
