# 상태 관리 전략

## 상태 분류

| 구분 | 정의 | 예시 | 관리 도구 |
|------|------|------|----------|
| 서버 상태 | 서버(Supabase)에서 가져오는 비동기 데이터 | 할 일 목록, 사용자 프로필 | fetch + useState / TanStack Query |
| 클라이언트 상태 | 클라이언트에서만 존재하는 전역 상태 | 인증 정보, 테마 설정 | React Context / Zustand |
| UI 상태 | 특정 컴포넌트의 로컬 상태 | 모달 열림, 입력값 | useState / useReducer |

## 서버 상태 관리

### 확정 도구: TanStack Query

서버 상태(비동기 데이터)는 **TanStack Query**로 관리한다. 캐싱, 자동 재시도, 백그라운드 리페칭을 지원한다.

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodos, createTodo } from "@/services/todoService";

// 조회
export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });
}

// 생성 + 캐시 무효화
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

## 클라이언트 상태 관리

### 확정 도구: Zustand

클라이언트 전역 상태는 **Zustand**로 관리한다. Provider 래핑이 불필요하고, selector를 통한 자동 리렌더링 최적화를 지원한다.

```ts
// src/stores/useThemeStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    { name: "theme-storage" }
  )
);
```

## UI 상태 관리

| 도구 | 사용 시점 | 예시 |
|------|----------|------|
| `useState` | 단순 토글, 단일 값 | 모달 열림, 탭 선택 |
| `useReducer` | 복잡한 상태 로직, 여러 필드 연관 | 다단계 폼, 복합 필터 |

```tsx
// useReducer 예제: 복잡한 폼 상태
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_ERROR"; field: string; error: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_END" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_END":
      return { ...state, isSubmitting: false };
  }
}
```

## Supabase Realtime 구독과 상태 동기화

### 기본 구독 패턴

```tsx
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useTodoSubscription(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
```

### TanStack Query 연동

Realtime 이벤트 수신 시 캐시를 무효화하여 최신 데이터를 가져온다.

```tsx
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTodoRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("todos-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["todos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
```

## stores/ 디렉토리 구조

- **Zustand 사용 시**: `src/stores/` 디렉토리에 스토어 파일을 배치한다.
- **React Context만 사용 시**: `src/contexts/` 디렉토리에 Context 파일을 배치한다.
- 파일 네이밍: `use[도메인]Store.ts` (예: `useThemeStore.ts`, `useCartStore.ts`)

```
# Zustand 사용 시
src/stores/
├── useThemeStore.ts
├── useCartStore.ts
└── useNotificationStore.ts

# React Context만 사용 시
src/contexts/
├── AuthContext.tsx
└── ThemeContext.tsx
```

## 관련 문서

- [프로젝트 구조](project-structure.md)
- [성능 최적화 가이드](performance-guide.md)
