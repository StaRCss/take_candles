import { fetchCandles } from "./services/binance.service";

async function main() {
  try {
    await fetchCandles();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
