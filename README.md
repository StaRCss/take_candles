# Take Candles

A scalable TypeScript backend service for fetching historical candlestick data
from the Binance API and storing it locally.

## Features

- Fetch historical candle data
- Configurable via environment variables
- Type-safe with TypeScript
- Environment validation using Zod
- Clean layered architecture
- CSV export support

## Project Structure

src/
  config/       → Environment configuration & validation
  services/     → Binance data fetching logic
  utils/        → Reusable utilities
  types/        → Type definitions
  index.ts      → Application entry point

## Installation

npm install

## Environment Setup

Create a `.env` file in the project root:

SYMBOL=BTCUSDT
INTERVAL=1m
LIMIT=500
REQ_DELAY_MS=150
START_DATE=2024-01-01T00:00:00Z
OUTPUT_FILE=BTCUSDT_1m.csv

## Run

npm start

## Architecture Philosophy

This project separates:

- Configuration
- Business logic
- Utilities
- Types
- Entry point

Designed to evolve into:

- Database-backed service
- REST API
- Background ingestion worker
- Frontend integration
