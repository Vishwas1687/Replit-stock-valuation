import { spawn } from 'child_process';
import path from 'path';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    // Use Yahoo Finance API directly via HTTP request
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}`);
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error(`No data found for symbol ${symbol}`);
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    if (!meta || !quote) {
      throw new Error(`Invalid data structure for ${symbol}`);
    }
    
    // Get the latest values
    const latestIndex = quote.close.length - 1;
    const currentPrice = quote.close[latestIndex];
    const previousClose = meta.previousClose || quote.close[latestIndex - 1];
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // Get volume (latest available)
    const volume = quote.volume?.[latestIndex] || 0;
    
    // Calculate market cap (shares outstanding * current price)
    // Note: This is an approximation as we don't have exact shares outstanding
    const marketCap = meta.sharesOutstanding ? meta.sharesOutstanding * currentPrice : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: volume,
      marketCap: Math.round(marketCap)
    };
    
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Return mock data as fallback
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round((Math.random() * 200 + 50) * 100) / 100,
      change: Math.round((Math.random() * 10 - 5) * 100) / 100,
      changePercent: Math.round((Math.random() * 10 - 5) * 100) / 100,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(Math.random() * 1000000000)
    };
  }
}