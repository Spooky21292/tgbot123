import { db } from '@/lib/db';

export type MarketQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  asOf: string;
  source: string;
};

export type MarketCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

const provider = (process.env.MARKET_DATA_PROVIDER ?? 'demo').toLowerCase();
const apiKey = process.env.MARKET_DATA_API_KEY ?? '';

function hashSymbol(symbol: string) {
  return symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function basePriceForSymbol(symbol: string) {
  const map: Record<string, number> = {
    AAPL: 212.4,
    TSLA: 178.3,
    NVDA: 901.5,
    'BTC/USD': 68250,
    'ETH/USD': 3520,
    'EUR/USD': 1.09
  };
  return map[symbol] ?? 100 + hashSymbol(symbol);
}

function demoQuote(symbol: string): MarketQuote {
  const seed = hashSymbol(symbol);
  const base = basePriceForSymbol(symbol);
  const wave = Math.sin(seed) * (symbol.includes('USD') && symbol.includes('BTC') ? 450 : base * 0.018);
  const price = Number((base + wave).toFixed(symbol.includes('EUR/USD') ? 4 : 2));
  const prev = base;
  const change = Number((price - prev).toFixed(symbol.includes('EUR/USD') ? 4 : 2));
  const changePercent = Number(((change / prev) * 100).toFixed(2));
  return { symbol, price, change, changePercent, asOf: new Date().toISOString(), source: 'demo' };
}

function demoCandles(symbol: string, points = 30): MarketCandle[] {
  const base = basePriceForSymbol(symbol);
  const seed = hashSymbol(symbol);
  const precision = symbol === 'EUR/USD' ? 4 : 2;
  return Array.from({ length: points }, (_, index) => {
    const time = new Date(Date.now() - (points - index) * 24 * 60 * 60 * 1000).toISOString();
    const drift = Math.sin((seed + index) / 2) * (symbol.includes('BTC') ? 900 : base * 0.015);
    const close = Number((base + drift + index * base * 0.0008).toFixed(precision));
    const open = Number((close - Math.cos(seed + index) * (symbol.includes('EUR/USD') ? 0.002 : base * 0.004)).toFixed(precision));
    const high = Number((Math.max(open, close) + Math.abs(Math.sin(index)) * (symbol.includes('EUR/USD') ? 0.003 : base * 0.006)).toFixed(precision));
    const low = Number((Math.min(open, close) - Math.abs(Math.cos(index)) * (symbol.includes('EUR/USD') ? 0.003 : base * 0.006)).toFixed(precision));
    return { time, open, high, low, close };
  });
}

async function fetchAlphaVantageQuote(symbol: string): Promise<MarketQuote | null> {
  if (!apiKey) return null;
  const isCrypto = symbol === 'BTC/USD' || symbol === 'ETH/USD';
  const isFx = symbol === 'EUR/USD';
  let url = '';
  if (isCrypto) {
    const [from, to] = symbol.split('/');
    url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
  } else if (isFx) {
    const [from, to] = symbol.split('/');
    url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`;
  } else {
    url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  }
  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  if (isCrypto || isFx) {
    const rate = Number(data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']);
    if (!rate) return null;
    return { symbol, price: rate, change: 0, changePercent: 0, asOf: new Date().toISOString(), source: 'alphavantage' };
  }
  const quote = data?.['Global Quote'];
  const price = Number(quote?.['05. price']);
  const change = Number(quote?.['09. change']);
  const changePercent = Number(String(quote?.['10. change percent'] ?? '0').replace('%', ''));
  if (!price) return null;
  return { symbol, price, change, changePercent, asOf: new Date().toISOString(), source: 'alphavantage' };
}

async function fetchTwelveDataQuote(symbol: string): Promise<MarketQuote | null> {
  if (!apiKey) return null;
  const providerSymbol = symbol.replace('/', '/');
  const response = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(providerSymbol)}&apikey=${apiKey}`, { next: { revalidate: 120 } });
  if (!response.ok) return null;
  const data = await response.json();
  const price = Number(data?.close);
  if (!price) return null;
  return {
    symbol,
    price,
    change: Number(data?.change ?? 0),
    changePercent: Number(data?.percent_change ?? 0),
    asOf: new Date().toISOString(),
    source: 'twelvedata'
  };
}

async function fetchAlphaVantageCandles(symbol: string): Promise<MarketCandle[] | null> {
  if (!apiKey) return null;
  const isCrypto = symbol === 'BTC/USD' || symbol === 'ETH/USD';
  const isFx = symbol === 'EUR/USD';
  let url = '';
  if (isCrypto) {
    const [from, to] = symbol.split('/');
    url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${from}&market=${to}&apikey=${apiKey}`;
  } else if (isFx) {
    const [from, to] = symbol.split('/');
    url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${apiKey}`;
  } else {
    url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  }
  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  const raw = data['Time Series (Daily)'] ?? data['Time Series FX (Daily)'] ?? data['Time Series (Digital Currency Daily)'];
  if (!raw) return null;
  const entries = Object.entries(raw).slice(0, 30).reverse();
  return entries.map(([time, value]: any) => ({
    time: new Date(time).toISOString(),
    open: Number(value['1. open'] ?? value['1a. open (USD)']),
    high: Number(value['2. high'] ?? value['2a. high (USD)']),
    low: Number(value['3. low'] ?? value['3a. low (USD)']),
    close: Number(value['4. close'] ?? value['4a. close (USD)'])
  }));
}

async function fetchTwelveDataCandles(symbol: string): Promise<MarketCandle[] | null> {
  if (!apiKey) return null;
  const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=30&apikey=${apiKey}`, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data?.values)) return null;
  return data.values.slice(0, 30).reverse().map((item: any) => ({
    time: new Date(item.datetime).toISOString(),
    open: Number(item.open),
    high: Number(item.high),
    low: Number(item.low),
    close: Number(item.close)
  }));
}

export async function getMarketQuote(symbol: string): Promise<MarketQuote> {
  const normalized = symbol.toUpperCase();
  try {
    if (provider === 'alphavantage') {
      const quote = await fetchAlphaVantageQuote(normalized);
      if (quote) return quote;
    }
    if (provider === 'twelvedata') {
      const quote = await fetchTwelveDataQuote(normalized);
      if (quote) return quote;
    }
  } catch {
    // fall back to demo
  }
  return demoQuote(normalized);
}

export async function getMarketCandles(symbol: string): Promise<MarketCandle[]> {
  const normalized = symbol.toUpperCase();
  try {
    if (provider === 'alphavantage') {
      const candles = await fetchAlphaVantageCandles(normalized);
      if (candles?.length) return candles;
    }
    if (provider === 'twelvedata') {
      const candles = await fetchTwelveDataCandles(normalized);
      if (candles?.length) return candles;
    }
  } catch {
    // fall back to demo
  }
  return demoCandles(normalized);
}

export async function getWatchlistAssets(search?: string) {
  return db.asset.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { symbol: { contains: search } },
              { name: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: { symbol: 'asc' }
  });
}

export async function getWatchlistQuotes(search?: string) {
  const assets = await getWatchlistAssets(search);
  const quotes = await Promise.all(assets.map((asset) => getMarketQuote(asset.symbol)));
  return assets.map((asset, index) => ({ asset, quote: quotes[index] }));
}
