export type DiagnosticStatus = "OK" | "Warning" | "Not Available" | "Unknown";

export interface DiagnosticItem {
  label: string;
  status: DiagnosticStatus;
  detail: string;
}

export interface DiagnosticReport {
  createdAt: string;
  userAgent: string;
  items: DiagnosticItem[];
  viewport: { width: number; height: number; devicePixelRatio: number };
}
