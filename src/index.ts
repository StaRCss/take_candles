// ========================
// Binance 5m Candle Fetcher using the API https://api.binance.com/api/v3/klines
// Fetches historical 5-minute interval candlestick data for a specified trading pair (e.g., BTCUSDT)
// and saves it to a JSON file.
// ------------------------
// Sections:
// 1. Imports
// 2. Interfaces
// 3. Configuration
// 4. Helpers
// 5. Fetching Logic 
// ========================


// Each candle represents market data for a specific time period
// Binance API returns candle data in a specific format as an array of arrays 
//Binance returns timestamps in milliseconds since the Unix epoch (1970-01-01T00:00:00Z)
//Prices and volume are returned as strings to preserve precision

// example of one candle array from Binance:
// [
//   1499040000000,      // Open time   
//   "0.01634790",       // Open price
//   "0.80000000",       // High price
//   "0.01575800",       // Low price
//   "0.01577100",       // Close price
//   "148976.11427815",  // Volume
//   1499644799999,      // Close time
//   "2434.19055334",    // Quote asset volume
//   308,                // Number of trades
//   "1756.87402397",    // Taker buy base asset volume
//   "28.46694368",      // Taker buy quote asset volume
//   "17928899.62484339" // Ignore.
// ]




//1. Imports
import axios from 'axios'; // For making HTTP requests
import fs from 'fs'; // For file system operations
import path from 'path'; // For handling file paths
import { setTimeout } from 'timers/promises'; // For adding delays between requests




//2. Interfaces
// We only include the fields we need for our application
interface Candle {
    openTime: number;  // The time the candle opens in milliseconds from Unix epoch as a number
    open: string; // The opening price as a string
    high : string ; // The highest price as a string
    low : string; // The lowest price as a string
    close : string;  // The closing price as a string
    volume : string ; // The volume as a string
    closeTime : number ;    // The time the candle closes in milliseconds from Unix  epoch as a number
}

//3. Configuration
// Configuration for the API request and data fetching process 
// You can modify these constants to change the trading pair, interval, date range, etc.

const SYMBOL = 'BTCUSDT'; // Trading pair symbol case-sensitive (BTSUSDT, BTCUSDT, ETHUSDT, etc.) ALWAYS UPPERCASE
const INTERVAL = '5m'; // Candle interval (5 minutes)
const LIMIT  = 500; // Number of candles to fetch in a single API call (max 1000 for Binance)
const START_DATE = new Date( new Date('2025-01-01T00:00:00Z').getTime()); // Start date for fetching candles (YYYY-MM-DDTHH:MM:SSZ format, UTC time)
const OUTPUT_FILE = `${SYMBOL}_${INTERVAL}.csv`;// Output file name to save the fetched candle data
const REQ_DELAY_MS =  150; // Delay between requests in milliseconds to avoid rate limits


//4. Helpers

/**
 * Converts raw Binance candle array into a typed Candle object.
 * @param raw - An array returned from Binance API representing a candle.
 * @returns Candle object with named fields.
 */
function mapCandle(raw: any[]): Candle & { openISO: string; closeISO: string } {
    return {
        openTime : raw[0],
        open : raw[1],
        high: raw[2],
        low : raw[3],
        close : raw[4],
        volume : raw [5],
        closeTime : raw[6],
        openISO: formatCandleTime(raw[0]), // ISO string for open time
        closeISO: formatCandleTime(raw[6]) // ISO string for close time  
    };
}

//Convers millisecond timestamp to ISO string format 
// Example: 1499040000000 -> "2017-07-03T09:00:00.000Z"
function  formatCandleTime (ts: number ) : string {              
return new Date(ts).toISOString();                              
}

//Function to delay excecution for a given number of milliseconds
async function delay (ms:number) {    // can be uses as await delay(REQ_DELAY_MS) and delays for 150 milliseconds as defined in REQ_DELAY_MS
    await setTimeout(ms);                 
}


//Saves an array of Candle objects to a csv file
function saveCandlesToFile(candles: (Candle & { openISO: string; closeISO: string })[], filename: string) {        // example: saveCandlesToFile(candles, 'BTS_5m_candles.csv')
    const header = 'openTime,open,high,low,close,volume,closeTime,openISO,closeISO\n'; // CSV header
    const rows = candles.map(candle => 
        `${candle.openTime},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume},${candle.closeTime},${candle.openISO},${candle.closeISO}`
    ).join('\n');

      // 👇 write to CSV file
  fs.writeFileSync(filename, header + rows);
  console.log(`Saved ${candles.length} candles to ${filename}`);
}


//5. Fetching Logic
// Main function to fetch candles from Binance API
async function fetchCandles() {
    const startFetch = Date.now(); // Timestamp to measure fetch start time
    let allCandles: Candle[] = []; // Array to store all fetched candles
    let startTime = START_DATE.getTime(); // Convert start date to milliseconds since Unix epoch
    let fetchMore = true; // Flag to control the fetching loop

    console.log(`Starting to fetch ${SYMBOL} ${INTERVAL} candles from ${START_DATE.toISOString()} at ${startFetch} `);

    // Loop to fetch candles in batches of size LIMIT until no more candles are available
    while (fetchMore) {
        try {
            // Make the API request to fetch candles
            const response = await axios.get('https://api.binance.com/api/v3/klines', {
                params: {
                    symbol: SYMBOL,
                    interval: INTERVAL,
                    startTime: startTime,
                    limit: LIMIT
                }
            });

          const rawCandles = response.data; // Raw candle data from the API response


            if (rawCandles.length === 0) {
                console.log('No more candles to fetch.');
                break; // Exit the loop if no more candles are returned
            }
              
                console.log(`Fetched ${rawCandles.length} candles starting from ${formatCandleTime(startTime)}`); // Log the number of candles fetched in this batch



            // Map raw candle data to typed Candle objects
            const candles = rawCandles.map((candle: any[]) => mapCandle(candle));
            allCandles.push(...candles);
            console.log(`Fetched ${candles.length} candles. Total so far: ${allCandles.length}`);
            // Move startTime forward to avoid fetching the same candle again
            startTime = candles[candles.length - 1].closeTime + 1;
            // If we received less than the limit, we have fetched all available candles
            if (candles.length < LIMIT) {
                fetchMore = false;
            }
            // Delay to avoid hitting API rate limits
            await delay(REQ_DELAY_MS);
        }

        catch (error) {
            console.error('Error fetching candles:', error);
            fetchMore = false; // Exit the loop on error
        }
    }
    // Save all fetched candles to a file
    saveCandlesToFile(allCandles.map(candle => mapCandle([
        candle.openTime,
        candle.open,
        candle.high,
        candle.low,
        candle.close,
        candle.volume,
        candle.closeTime
    ])), path.join(__dirname, OUTPUT_FILE));
    const endFetch = Date.now();
    console.log(`Fetching completed in ${(endFetch - startFetch) / 1000} seconds.`);
}
fetchCandles(); // Start the fetching process

export {}; // Ensure this file is treated as a module

// To run this script:
// 1. Ensure you have Node.js and npm installed.
// 2. Create a new directory and navigate into it.
// 3. Run `npm init -y` to create a package.json file.  
// 4. Run `npm install axios` to install the axios library.
// 5. Save this script as `index.ts` in the directory.
// 6. Create a `tsconfig.json` file with appropriate settings for TypeScript.
// 7. Run the script using `npx ts-node src/index.ts`.
// 8. The fetched candle data will be saved to `BTS_5m_candles.json` in the same directory.
