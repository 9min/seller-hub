import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useDashboardData } from "@/hooks/useDashboardData";

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) =>
		QueryClientProvider({ client: queryClient, children });
}

describe("useDashboardData", () => {
	it("KPI 메트릭 데이터를 반환한다", async () => {
		const { result } = renderHook(() => useDashboardData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.kpiMetrics).toHaveLength(4);
	});

	it("차트 데이터를 반환한다", async () => {
		const { result } = renderHook(() => useDashboardData(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.categoryData.length).toBeGreaterThan(0);
	});
});
