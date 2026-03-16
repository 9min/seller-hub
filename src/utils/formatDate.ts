export function formatDate(value: string | null): string {
	if (!value) return "-";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
		.format(new Date(value))
		.replace(/\. /g, "-")
		.replace(/\.$/, "");
}

export function formatDateTime(value: string | null): string {
	if (!value) return "-";
	const date = new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
		.format(new Date(value))
		.replace(/\. /g, "-")
		.replace(/\.$/, "");
	const time = new Intl.DateTimeFormat("ko-KR", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(new Date(value));
	return `${date} ${time}`;
}
