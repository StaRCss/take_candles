import axios from "axios";
import path from "path";
import { env } from "../config/env";
import { Candle, CandleWithISO } from "../types/candle";
import { formatCandleTime, delay } from "../utils/time";
import { saveCandlesToFile } from "../utils/file";

function mapCandle(raw: any[]): CandleWithISO {
  return {
    openTime: raw[0],
    open: raw[1],
    high: raw[2],
    low: raw[3],
    close: raw[4],
    volume: raw[5],
    closeTime: raw[6],
    openISO: formatCandleTime(raw[0]),
    closeISO: formatCandleTime(raw[6]),
  };
}

export async function fetchCandles() {
  const startFetch = Date.now();
  let allCandles: CandleWithISO[] = [];
  let startTime = new Date(env.START_DATE).getTime();
  let fetchMore = true;

  console.log(
    `🚀 Fetching ${env.SYMBOL} ${env.INTERVAL} from ${env.START_DATE}`
  );

  while (fetchMore) {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: env.SYMBOL,
            interval: env.INTERVAL,
            startTime,
            limit: env.LIMIT,
          },
        }
      );

      const rawCandles = response.data;

      if (rawCandles.length === 0) {
        break;
      }

      const candles = rawCandles.map((c: any[]) => mapCandle(c));

      allCandles.push(...candles);

      startTime = candles[candles.length - 1].closeTime + 1;

      if (candles.length < env.LIMIT) {
        fetchMore = false;
      }

      await delay(env.REQ_DELAY_MS);
    } catch (error) {
      console.error("❌ Error fetching candles:", error);
      fetchMore = false;
    }
  }

  saveCandlesToFile(
    allCandles,
    path.join(process.cwd(), env.OUTPUT_FILE)
  );

  const endFetch = Date.now();
  console.log(
    `⏱ Completed in ${(endFetch - startFetch) / 1000} seconds`
  );
}
