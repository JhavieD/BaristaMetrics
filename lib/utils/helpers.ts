export function formatQuantity(value: number, unit: string): string {
  return `${value.toFixed(2)} ${unit}`;
}

export function calculateVariance(expected: number, actual: number): number {
  if (expected === 0) return actual === 0 ? 0 : 100;
  return ((actual - expected) / expected) * 100;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function isLowStock(expected: number, threshold: number): boolean {
  return expected <= threshold;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
