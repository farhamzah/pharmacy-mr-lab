export function formatGram(value: number): string {
  return `${value.toFixed(3)} g`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
