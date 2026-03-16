# 프로젝트 구조 가이드

## 프로젝트 루트 구조

Supabase를 백엔드로 사용하므로, 별도의 서버 앱 없이 프론트엔드 + Supabase 구조를 따른다.

```
프로젝트-루트/
├── .vscode/                    # VSCode 설정 (settings.json, extensions.json 등)
├── .github/                    # GitHub Actions 워크플로우
│   └── workflows/
├── src/
│   ├── app/                    # 앱 진입점, 라우팅 설정
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # 기본 UI 컴포넌트 (Button, Input 등)
│   │   ├── layout/             # 레이아웃 컴포넌트 (Header, Footer 등)
│   │   └── feature/            # 기능별 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── pages/                  # 페이지 컴포넌트
│   ├── lib/                    # 외부 라이브러리 설정 (Supabase 클라이언트 등)
│   ├── services/               # 비즈니스 로직 및 Supabase 쿼리 함수
│   ├── stores/                 # 상태 관리 (상세: state-management.md 참조)
│   ├── types/                  # TypeScript 타입 정의
│   ├── utils/                  # 유틸리티 함수
│   └── constants/              # 상수 정의
├── supabase/
│   ├── migrations/             # 데이터베이스 마이그레이션
│   ├── functions/              # Edge Functions
│   ├── seed.sql                # 시드 데이터 (선택)
│   └── config.toml             # Supabase 로컬 설정
├── tests/                      # 테스트 파일
├── docs/                       # 프로젝트 문서
├── public/                     # 정적 파일
├── .env.example                # 환경변수 키 목록 (Git 추적)
├── .env.local                  # 로컬 환경변수 (Git 미추적)
├── index.html
├── biome.json                  # Biome 설정
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md                   # Claude Code 규칙
```

## 주요 디렉토리 설명

### `src/lib/` — 외부 라이브러리 설정

Supabase 클라이언트 인스턴스를 생성하고 내보내는 파일을 포함한다.

```ts
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Supabase 클라이언트 종류

| 함수 | 패키지 | 용도 |
|------|--------|------|
| `createClient` | `@supabase/supabase-js` | SPA 기본 클라이언트 |
| `createBrowserClient` | `@supabase/ssr` | SSR 프레임워크 브라우저 측 |
| `createServerClient` | `@supabase/ssr` | SSR 프레임워크 서버 측 |

**SPA에서는 `createClient`만 사용한다.** SSR(Next.js 등) 도입 시에만 `@supabase/ssr` 패키지의 `createBrowserClient`/`createServerClient`를 사용한다.

### `src/services/` — Supabase 쿼리 함수

테이블별로 파일을 분리하여 CRUD 함수를 정의한다.

```ts
// src/services/todoService.ts
import { supabase } from "@/lib/supabase";
import type { Todo, CreateTodoInput } from "@/types/todo";

export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### `src/types/` — 타입 정의

Supabase CLI로 생성한 데이터베이스 타입을 포함한다.

```ts
// src/types/database.ts — Supabase CLI로 자동 생성
// npx supabase gen types typescript --local > src/types/database.ts

// src/types/todo.ts — 앱에서 사용하는 커스텀 타입
import type { Database } from "./database";

export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type CreateTodoInput = Database["public"]["Tables"]["todos"]["Insert"];
export type UpdateTodoInput = Database["public"]["Tables"]["todos"]["Update"];
```

### `supabase/migrations/` — 데이터베이스 마이그레이션

Supabase CLI를 사용하여 마이그레이션을 관리한다.

```bash
# 새 마이그레이션 생성
npx supabase migration new create_todos_table

# 로컬에 마이그레이션 적용
npx supabase db reset

# 타입 재생성
npx supabase gen types typescript --local > src/types/database.ts
```

마이그레이션 파일에는 RLS 정책을 반드시 포함한다:

```sql
-- supabase/migrations/20240101000000_create_todos_table.sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회 가능
CREATE POLICY "사용자 본인 조회" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- 본인만 생성 가능
CREATE POLICY "사용자 본인 생성" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 데이터만 수정 가능
CREATE POLICY "사용자 본인 수정" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- 본인 데이터만 삭제 가능
CREATE POLICY "사용자 본인 삭제" ON todos
  FOR DELETE USING (auth.uid() = user_id);
```

### `supabase/functions/` — Edge Functions

클라이언트에서 직접 처리하기 어려운 복잡한 비즈니스 로직을 구현한다.

```ts
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 비즈니스 로직 처리
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## 경로 Alias 설정

`@/` 경로 alias를 설정하여 상대 경로 대신 절대 경로를 사용한다.

### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### vite.config.ts

```ts
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
```

사용 예시:

```ts
// 좋은 예: alias 사용
import { supabase } from "@/lib/supabase";

// 나쁜 예: 상대 경로
import { supabase } from "../../../lib/supabase";
```

## 환경변수 파일 구조

| 파일 | 역할 | Git 추적 | 비고 |
|------|------|----------|------|
| `.env.example` | 환경변수 키 목록 (값 없음) | O | 팀원 온보딩용 |
| `.env.local` | 로컬 개발용 실제 값 | X | 각 개발자가 생성 |
| `.env` | 빌드/배포 시 사용 | X | CI/CD에서 주입 |

Vite 프로젝트에서는 클라이언트에서 접근할 환경변수에 `VITE_` 접두사를 붙인다.

상세 설정은 [개발 환경 셋업 가이드](dev-environment.md)를 참조한다.

## 네이밍 컨벤션

### 파일/폴더 이름

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | `PascalCase.tsx` | `LoginForm.tsx` |
| 훅 파일 | `camelCase.ts` | `useAuth.ts` |
| 서비스 파일 | `camelCase.ts` | `todoService.ts` |
| 유틸리티 파일 | `camelCase.ts` | `formatDate.ts` |
| 타입 파일 | `camelCase.ts` | `user.ts` |
| 테스트 파일 | `*.test.ts(x)` | `LoginForm.test.tsx` |
| 상수 파일 | `camelCase.ts` | `apiEndpoints.ts` |
| DB 마이그레이션 | 자동 생성 (타임스탬프) | `20240101000000_create_todos.sql` |
| Edge Functions | `kebab-case` 폴더 | `send-notification/index.ts` |

### 코드 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | `PascalCase` | `LoginForm`, `UserProfile` |
| 함수 | `camelCase` | `getUserById`, `formatDate` |
| 변수 | `camelCase` | `userName`, `isLoading` |
| 상수 | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_RETRY` |
| 타입/인터페이스 | `PascalCase` | `User`, `ApiResponse` |
| Enum | `PascalCase` (멤버도) | `UserRole.Admin` |
| 커스텀 훅 | `use` 접두사 + `camelCase` | `useAuth`, `useFetch` |
| 이벤트 핸들러 | `handle` 접두사 | `handleSubmit`, `handleClick` |
| Boolean 변수 | `is`/`has`/`should` 접두사 | `isLoading`, `hasError` |
| DB 테이블 | `snake_case` (복수형) | `todos`, `user_profiles` |
| DB 컬럼 | `snake_case` | `created_at`, `user_id` |
| RLS 정책 | 한국어 서술형 | `사용자 본인 조회` |

### 컴포넌트 구조

하나의 컴포넌트 파일은 다음 순서로 구성한다:

```tsx
// 1. import 문
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/user";

// 2. 타입 정의
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

// 3. 컴포넌트 함수
export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  // 3-1. 훅
  const [email, setEmail] = useState("");

  // 3-2. 이벤트 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  // 3-3. 렌더링
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## 관련 문서

- [디자인 가이드](design-guide.md)
- [린트 설정](lint-config.md)
- [보안 가이드](security-guide.md)
- [개발 환경 셋업](dev-environment.md)
- [상태 관리 전략](state-management.md)
