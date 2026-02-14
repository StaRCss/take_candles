export function formatCandleTime(ts: number): string {
  return new Date(ts).toISOString();
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
