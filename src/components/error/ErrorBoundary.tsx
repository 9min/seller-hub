import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { Sentry } from "@/lib/sentry";
import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * React Error Boundary는 클래스 컴포넌트로만 구현 가능하다.
 * CLAUDE.md에서 함수형 컴포넌트를 권장하나 이것은 React의 제약사항으로 예외 처리한다.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("[ErrorBoundary] 에러 발생:", error, errorInfo);
		Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
	}

	resetErrorBoundary = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback({
					error: this.state.error,
					resetErrorBoundary: this.resetErrorBoundary,
				});
			}

			return (
				<ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
			);
		}

		return this.props.children;
	}
}
