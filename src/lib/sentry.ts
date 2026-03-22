import * as Sentry from "@sentry/react";

/**
 * Sentry 초기화. VITE_SENTRY_DSN 환경변수가 없으면 비활성화한다.
 */
export function initSentry() {
	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (!dsn) return;

	Sentry.init({
		dsn,
		environment: import.meta.env.MODE,
		enabled: true,
		tracesSampleRate: 0.1,
	});
}

export { Sentry };
