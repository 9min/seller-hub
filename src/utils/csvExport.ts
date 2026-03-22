interface CsvColumn<T> {
	key: keyof T;
	header: string;
}

export function exportToCSV<T>(data: T[], filename: string, columns: CsvColumn<T>[]) {
	const BOM = "\uFEFF";
	const header = columns.map((col) => col.header).join(",");

	const rows = data.map((item) =>
		columns
			.map((col) => {
				const value = (item as Record<string, unknown>)[col.key as string];
				if (value == null) return "";
				const str = String(value);
				if (str.includes(",") || str.includes('"') || str.includes("\n")) {
					return `"${str.replace(/"/g, '""')}"`;
				}
				return str;
			})
			.join(","),
	);

	const csv = BOM + [header, ...rows].join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", `${filename}.csv`);
	link.click();
	URL.revokeObjectURL(url);
}
