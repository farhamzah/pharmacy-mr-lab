export function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}
