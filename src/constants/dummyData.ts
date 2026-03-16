import type { CategoryDataPoint, ChartPeriod, SalesDataPoint } from "@/types/chart";
import type { KpiMetric } from "@/types/kpi";
import type { Order, OrderStatus } from "@/types/order";
import { formatCount, formatCurrency, formatPercent } from "@/utils/formatNumber";

const CATEGORIES = ["패션의류", "전자기기", "뷰티", "스포츠", "홈리빙", "식품"];

const CATEGORY_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

const BUYER_NAMES = [
	"김민준",
	"이서연",
	"박지호",
	"최예은",
	"정우진",
	"강수빈",
	"윤도현",
	"임채원",
	"한지민",
	"오승현",
	"서예진",
	"신동혁",
	"류지수",
	"허민재",
	"남기현",
	"백소영",
	"전태양",
	"문서현",
	"양준혁",
	"조예림",
	"송민우",
	"권나연",
	"고태준",
	"유지아",
	"홍성민",
	"안채연",
	"차민서",
	"황준서",
	"노은지",
	"배지훈",
];

const PRODUCT_NAMES: Record<string, string[]> = {
	패션의류: ["여름 린넨 셔츠", "슬림 데님 팬츠", "오버핏 후디", "캐주얼 원피스", "트렌치코트"],
	전자기기: ["무선 이어버드", "스마트워치", "블루투스 스피커", "보조배터리", "노이즈캔슬링 헤드폰"],
	뷰티: ["수분 크림", "선크림 SPF50", "에센스 세럼", "클렌징 폼", "립밤"],
	스포츠: ["러닝화", "요가매트", "프로틴 셰이커", "스포츠 레깅스", "케틀벨"],
	홈리빙: ["디퓨저 세트", "캔들홀더", "수납 바구니", "전동 칫솔", "침구 세트"],
	식품: ["유기농 그래놀라", "콜드브루 원액", "견과류 믹스", "프로틴바", "녹차 티백"],
};

const ORDER_STATUSES: OrderStatus[] = [
	"PAYMENT_COMPLETE",
	"PREPARING",
	"SHIPPING",
	"DELIVERED",
	"DELIVERED",
	"DELIVERED",
	"RETURN_REQUESTED",
	"EXCHANGE_REQUESTED",
	"CANCELLED",
];

function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 1664525 + 1013904223) & 0xffffffff;
		return (s >>> 0) / 0xffffffff;
	};
}

export function generateOrders(count: number): Order[] {
	const rand = seededRandom(42);
	const now = new Date("2026-03-16T00:00:00.000Z");
	const orders: Order[] = [];

	for (let i = 0; i < count; i++) {
		const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)] ?? "패션의류";
		const products = PRODUCT_NAMES[category] ?? ["상품"];
		const productName = products[Math.floor(rand() * products.length)] ?? "상품";
		const buyerName = BUYER_NAMES[Math.floor(rand() * BUYER_NAMES.length)] ?? "구매자";
		const status = ORDER_STATUSES[Math.floor(rand() * ORDER_STATUSES.length)] ?? "PREPARING";
		const quantity = Math.floor(rand() * 5) + 1;
		const unitPrice = (Math.floor(rand() * 100) + 1) * 1000;
		const totalPrice = unitPrice * quantity;

		const daysAgo = Math.floor(rand() * 90);
		const orderedAt = new Date(now.getTime() - daysAgo * 86400000).toISOString();

		const isShipped = !["PAYMENT_COMPLETE", "PREPARING", "CANCELLED"].includes(status);
		const shippedAt = isShipped
			? new Date(new Date(orderedAt).getTime() + 2 * 86400000).toISOString()
			: null;

		const isDelivered = ["DELIVERED", "RETURN_REQUESTED", "EXCHANGE_REQUESTED"].includes(status);
		const deliveredAt =
			isDelivered && shippedAt
				? new Date(new Date(shippedAt).getTime() + 3 * 86400000).toISOString()
				: null;

		const isDelayed =
			status === "SHIPPING" &&
			shippedAt !== null &&
			now.getTime() - new Date(shippedAt).getTime() > 5 * 86400000;

		const dateStr = new Date(orderedAt).toISOString().slice(0, 10).replace(/-/g, "");
		const seq = String(i + 1).padStart(5, "0");

		orders.push({
			id: `order-${i + 1}`,
			orderNumber: `ORD-${dateStr}-${seq}`,
			buyerName,
			productName,
			category,
			quantity,
			unitPrice,
			totalPrice,
			status,
			orderedAt,
			shippedAt,
			deliveredAt,
			isDelayed,
		});
	}

	return orders;
}

export function computeKpiMetrics(orders: Order[]): KpiMetric[] {
	const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
	const newOrders = orders.filter((o) => o.status === "PAYMENT_COMPLETE").length;
	const delayedOrders = orders.filter((o) => o.isDelayed).length;
	const returnExchange = orders.filter(
		(o) => o.status === "RETURN_REQUESTED" || o.status === "EXCHANGE_REQUESTED",
	).length;
	const returnRate = orders.length > 0 ? (returnExchange / orders.length) * 100 : 0;

	return [
		{
			id: "total_revenue",
			label: "총 매출",
			value: totalRevenue,
			formattedValue: formatCurrency(totalRevenue),
			changeRate: 12.3,
			trend: "up",
			unit: "원",
			description: "전월 대비 +12.3%",
		},
		{
			id: "new_orders",
			label: "신규 주문",
			value: newOrders,
			formattedValue: formatCount(newOrders),
			changeRate: 8.1,
			trend: "up",
			unit: "건",
			description: "전월 대비 +8.1%",
		},
		{
			id: "delayed",
			label: "배송 지연",
			value: delayedOrders,
			formattedValue: formatCount(delayedOrders),
			changeRate: -3.2,
			trend: "down",
			unit: "건",
			description: "전월 대비 -3.2%",
		},
		{
			id: "return_rate",
			label: "반품/교환율",
			value: returnRate,
			formattedValue: formatPercent(returnRate),
			changeRate: 0.5,
			trend: "up",
			unit: "%",
			description: "전월 대비 +0.5%p",
		},
	];
}

export function computeSalesData(orders: Order[], period: ChartPeriod): SalesDataPoint[] {
	const map = new Map<string, number>();

	for (const order of orders) {
		const date = new Date(order.orderedAt);
		let label: string;

		if (period === "daily") {
			label = `${date.getMonth() + 1}/${date.getDate()}`;
		} else if (period === "weekly") {
			const weekNum = Math.ceil(date.getDate() / 7);
			label = `${date.getMonth() + 1}월 ${weekNum}주`;
		} else {
			label = `${date.getMonth() + 1}월`;
		}

		map.set(label, (map.get(label) ?? 0) + order.totalPrice);
	}

	return Array.from(map.entries())
		.slice(-30)
		.map(([label, revenue]) => ({ label, revenue }));
}

export function computeCategoryData(orders: Order[]): CategoryDataPoint[] {
	const map = new Map<string, number>();
	for (const order of orders) {
		map.set(order.category, (map.get(order.category) ?? 0) + 1);
	}

	return Array.from(map.entries()).map(([name, value], idx) => ({
		name,
		value,
		color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] ?? "#2563eb",
	}));
}
