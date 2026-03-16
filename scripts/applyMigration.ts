/**
 * 원격 Supabase에 마이그레이션 SQL을 적용하는 스크립트
 *
 * 사전 준비:
 *   1. https://supabase.com/dashboard/account/tokens 에서 Access Token 발급
 *   2. .env.local에 SUPABASE_ACCESS_TOKEN=<발급받은 토큰> 추가
 *
 * 실행:
 *   pnpm migrate:remote
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";

// project ref 추출 (https://[ref].supabase.co)
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!ACCESS_TOKEN) {
	console.error("❌ SUPABASE_ACCESS_TOKEN이 없습니다.");
	console.error("");
	console.error("📋 직접 Supabase 대시보드에서 SQL을 실행하세요:");
	console.error(
		`   https://supabase.com/dashboard/project/${PROJECT_REF ?? "<project-ref>"}/sql/new`,
	);
	console.error("");
	console.error("실행할 SQL:");
	console.error("─".repeat(60));

	// 마이그레이션 파일 목록 출력
	const migrationFiles = [
		"supabase/migrations/20260317000000_create_products_table.sql",
		"supabase/migrations/20260317000001_create_analytics_rpc.sql",
	];

	for (const file of migrationFiles) {
		try {
			console.error(`\n-- ${file}\n`);
			console.error(readFileSync(resolve(file), "utf-8"));
		} catch {
			console.error(`(파일 없음: ${file})`);
		}
	}
	process.exit(1);
}

if (!PROJECT_REF) {
	console.error("❌ VITE_SUPABASE_URL에서 프로젝트 ref를 파싱할 수 없습니다.");
	process.exit(1);
}

const MIGRATIONS = [
	"supabase/migrations/20260317000000_create_products_table.sql",
	"supabase/migrations/20260317000001_create_analytics_rpc.sql",
];

console.log(`🚀 프로젝트 ref: ${PROJECT_REF}`);

for (const file of MIGRATIONS) {
	let sql: string;
	try {
		sql = readFileSync(resolve(file), "utf-8");
	} catch {
		console.warn(`⚠️  파일 없음: ${file}`);
		continue;
	}

	console.log(`📄 마이그레이션 적용 중: ${file}`);

	const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ACCESS_TOKEN}`,
		},
		body: JSON.stringify({ query: sql }),
	});

	if (!res.ok) {
		const body = await res.text();
		console.error(`❌ 실패 (${res.status}): ${body}`);
		process.exit(1);
	}

	console.log(`✅ 완료: ${file}`);
}

console.log("\n🎉 모든 마이그레이션 적용 완료!");
console.log("   이제 pnpm seed:products 로 상품 더미 데이터를 삽입할 수 있습니다.");
