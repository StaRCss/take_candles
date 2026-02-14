import fs from "fs";
import { CandleWithISO } from "../types/candle";

export function saveCandlesToFile(
  candles: CandleWithISO[],
  filename: string
) {
  const header =
    "openTime,open,high,low,close,volume,closeTime,openISO,closeISO\n";

  const rows = candles
    .map(c =>
      `${c.openTime},${c.open},${c.high},${c.low},${c.close},${c.volume},${c.closeTime},${c.openISO},${c.closeISO}`
    )
    .join("\n");

  fs.writeFileSync(filename, header + rows);

  console.log(`✅ Saved ${candles.length} candles to ${filename}`);
}
