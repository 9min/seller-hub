import { Button } from "@/components/ui/Button";

interface ErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="max-w-md p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200">
				<div className="mb-4 text-4xl">!</div>
				<h2 className="mb-2 text-lg font-semibold text-gray-900">오류가 발생했습니다</h2>
				<p className="mb-6 text-sm text-gray-500">
					{error.message || "알 수 없는 오류가 발생했습니다."}
				</p>
				<div className="flex justify-center gap-3">
					<Button variant="secondary" onClick={() => (window.location.href = "/")}>
						홈으로 돌아가기
					</Button>
					<Button onClick={resetErrorBoundary}>다시 시도</Button>
				</div>
			</div>
		</div>
	);
}
