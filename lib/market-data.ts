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

export type MarketInterval = '1min' | '15min' | '1h' | '1day';

export type RussianAssetMeta = {
  symbol: string;
  name: string;
  type: 'stock' | 'bond';
  board: 'TQBR' | 'TQOB';
  market: 'shares' | 'bonds';
  currency: 'RUB';
  nominal?: number;
  annualCouponPercent?: number;
};

const provider = (process.env.MARKET_DATA_PROVIDER ?? 'moex').toLowerCase();
const apiKey = process.env.MARKET_DATA_API_KEY ?? '';

const RUSSIAN_ASSET_META: Record<string, RussianAssetMeta> = {
  SBER: {
    symbol: 'SBER',
    name: 'Сбербанк ао',
    type: 'stock',
    board: 'TQBR',
    market: 'shares',
    currency: 'RUB'
  },
  GAZP: {
    symbol: 'GAZP',
    name: 'Газпром',
    type: 'stock',
    board: 'TQBR',
    market: 'shares',
    currency: 'RUB'
  },
  LKOH: {
    symbol: 'LKOH',
    name: 'ЛУКОЙЛ',
    type: 'stock',
    board: 'TQBR',
    market: 'shares',
    currency: 'RUB'
  },
  SU26238RMFS4: {
    symbol: 'SU26238RMFS4',
    name: 'ОФЗ 26238',
    type: 'bond',
    board: 'TQOB',
    market: 'bonds',
    currency: 'RUB',
    nominal: 1000,
    annualCouponPercent: 7.1
  },
  SU26243RMFS4: {
    symbol: 'SU26243RMFS4',
    name: 'ОФЗ 26243',
    type: 'bond',
    board: 'TQOB',
    market: 'bonds',
    currency: 'RUB',
    nominal: 1000,
    annualCouponPercent: 9.8
  },
  SU26248RMFS3: {
    symbol: 'SU26248RMFS3',
    name: 'ОФЗ 26248',
    type: 'bond',
    board: 'TQOB',
    market: 'bonds',
    currency: 'RUB',
    nominal: 1000,
    annualCouponPercent: 12.25
  }
};

function hashSymbol(symbol: string) {
  return symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getRussianAssetMeta(symbol: string) {
  return RUSSIAN_ASSET_META[symbol.toUpperCase()] ?? null;
}

export function getCurrencySymbol(symbol: string) {
  const meta = getRussianAssetMeta(symbol);
  return meta?.currency === 'RUB' ? '₽' : '$';
}

function pricePrecision(symbol: string) {
  const meta = getRussianAssetMeta(symbol);
  return meta?.type === 'bond' ? 2 : 2;
}

function basePriceForSymbol(symbol: string) {
  const map: Record<string, number> = {
    SBER: 318.4,
    GAZP: 168.3,
    LKOH: 7420.0,
    SU26238RMFS4: 583.2,
    SU26243RMFS4: 646.8,
    SU26248RMFS3: 912.5
  };
  return map[symbol] ?? 100 + hashSymbol(symbol);
}

function demoQuote(symbol: string): MarketQuote {
  const seed = hashSymbol(symbol);
  const base = basePriceForSymbol(symbol);
  const meta = getRussianAssetMeta(symbol);
  const wave = Math.sin(seed) * (meta?.type === 'bond' ? base * 0.003 : base * 0.018);
  const precision = pricePrecision(symbol);
  const price = Number((base + wave).toFixed(precision));
  const prev = base;
  const change = Number((price - prev).toFixed(precision));
  const changePercent = Number(((change / prev) * 100).toFixed(2));
  return { symbol, price, change, changePercent, asOf: new Date().toISOString(), source: 'demo-ru' };
}

function demoCandles(symbol: string, points = 30, interval: MarketInterval = '1day'): MarketCandle[] {
  const base = basePriceForSymbol(symbol);
  const seed = hashSymbol(symbol);
  const precision = pricePrecision(symbol);
  const meta = getRussianAssetMeta(symbol);
  const intervalMs: Record<MarketInterval, number> = {
    '1min': 60 * 1000,
    '15min': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000
  };
  const amplitude = interval === '1min'
    ? (meta?.type === 'bond' ? base * 0.0012 : base * 0.0025)
    : interval === '15min'
      ? (meta?.type === 'bond' ? base * 0.0018 : base * 0.004)
      : interval === '1h'
        ? (meta?.type === 'bond' ? base * 0.0024 : base * 0.008)
        : (meta?.type === 'bond' ? base * 0.0045 : base * 0.015);

  return Array.from({ length: points }, (_, index) => {
    const step = points - index;
    const time = new Date(Date.now() - step * intervalMs[interval]).toISOString();
    const drift = Math.sin((seed + index) / 2.4) * amplitude;
    const trend = (index - points / 2) * (amplitude / Math.max(points * 6, 1));
    const close = Number((base + drift + trend).toFixed(precision));
    const open = Number((close - Math.cos(seed + index / 1.7) * amplitude * 0.32).toFixed(precision));
    const high = Number((Math.max(open, close) + Math.abs(Math.sin(index / 2)) * amplitude * 0.24).toFixed(precision));
    const low = Number((Math.min(open, close) - Math.abs(Math.cos(index / 2)) * amplitude * 0.24).toFixed(precision));
    return { time, open, high, low, close };
  });
}

function moexCandleInterval(interval: MarketInterval) {
  if (interval === '1min') return 1;
  if (interval === '1h') return 60;
  return 24;
}

function moexFromDate(interval: MarketInterval) {
  const now = new Date();
  const from = new Date(now);
  if (interval === '1min') {
    from.setDate(now.getDate() - 2);
  } else if (interval === '1h') {
    from.setDate(now.getDate() - 10);
  } else {
    from.setMonth(now.getMonth() - 2);
  }
  return from.toISOString().slice(0, 10);
}

async function fetchMoexJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    },
    next: { revalidate: 60 }
  });
  if (!response.ok) return null;
  return response.json();
}

function getRowValue(block: any, field: string) {
  const columns = block?.columns;
  const row = Array.isArray(block?.data) ? block.data[0] : null;
  if (!columns || !row) return null;
  const index = columns.indexOf(field);
  return index >= 0 ? row[index] : null;
}

async function fetchMoexQuote(symbol: string): Promise<MarketQuote | null> {
  const meta = getRussianAssetMeta(symbol);
  if (!meta) return null;

  const url = `https://iss.moex.com/iss/engines/stock/markets/${meta.market}/boards/${meta.board}/securities/${symbol}.json?iss.meta=off&iss.only=marketdata,securities`;
  const data = await fetchMoexJson(url);
  if (!data) return null;

  const marketPriceRaw =
    getRowValue(data.marketdata, 'LAST') ??
    getRowValue(data.marketdata, 'LCURRENTPRICE') ??
    getRowValue(data.marketdata, 'MARKETPRICE') ??
    getRowValue(data.securities, 'PREVLEGALCLOSEPRICE');

  const prevPriceRaw =
    getRowValue(data.marketdata, 'PREVPRICE') ??
    getRowValue(data.securities, 'PREVWAPRICE') ??
    getRowValue(data.securities, 'PREVPRICE');

  const price = Number(marketPriceRaw ?? 0);
  const prev = Number(prevPriceRaw ?? 0);
  if (!price) return null;

  const change = prev ? price - prev : 0;
  const changePercent = prev ? (change / prev) * 100 : 0;

  return {
    symbol,
    price: Number(price.toFixed(pricePrecision(symbol))),
    change: Number(change.toFixed(pricePrecision(symbol))),
    changePercent: Number(changePercent.toFixed(2)),
    asOf: new Date().toISOString(),
    source: 'moex'
  };
}

async function fetchMoexCandles(symbol: string, interval: MarketInterval = '1day', points = 30): Promise<MarketCandle[] | null> {
  const meta = getRussianAssetMeta(symbol);
  if (!meta) return null;

  const url = `https://iss.moex.com/iss/engines/stock/markets/${meta.market}/boards/${meta.board}/securities/${symbol}/candles.json?iss.meta=off&interval=${moexCandleInterval(interval)}&from=${moexFromDate(interval)}`;
  const data = await fetchMoexJson(url);
  const candles = Array.isArray(data?.candles?.data) ? data.candles.data : null;
  const columns = data?.candles?.columns;
  if (!candles || !columns) return null;

  const get = (row: any[], field: string) => {
    const index = columns.indexOf(field);
    return index >= 0 ? row[index] : null;
  };

  return candles.slice(-points).map((row: any[]) => ({
    time: new Date(get(row, 'begin')).toISOString(),
    open: Number(get(row, 'open')),
    high: Number(get(row, 'high')),
    low: Number(get(row, 'low')),
    close: Number(get(row, 'close'))
  })).filter((item) => item.open && item.high && item.low && item.close);
}

async function fetchAlphaVantageQuote(symbol: string): Promise<MarketQuote | null> {
  if (!apiKey) return null;
  const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  const quote = data?.['Global Quote'];
  const price = Number(quote?.['05. price']);
  const change = Number(quote?.['09. change']);
  const changePercent = Number(String(quote?.['10. change percent'] ?? '0').replace('%', ''));
  if (!price) return null;
  return { symbol, price, change, changePercent, asOf: new Date().toISOString(), source: 'alphavantage' };
}

async function fetchTwelveDataQuote(symbol: string): Promise<MarketQuote | null> {
  if (!apiKey) return null;
  const response = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`, { next: { revalidate: 120 } });
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

async function fetchAlphaVantageCandles(symbol: string, interval: MarketInterval = '1day', points = 30): Promise<MarketCandle[] | null> {
  if (!apiKey || interval !== '1day') return null;
  const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  const raw = data['Time Series (Daily)'];
  if (!raw) return null;
  const entries = Object.entries(raw).slice(0, points).reverse();
  return entries.map(([time, value]: any) => ({
    time: new Date(time).toISOString(),
    open: Number(value['1. open']),
    high: Number(value['2. high']),
    low: Number(value['3. low']),
    close: Number(value['4. close'])
  }));
}

async function fetchTwelveDataCandles(symbol: string, interval: MarketInterval = '1day', points = 30): Promise<MarketCandle[] | null> {
  if (!apiKey) return null;
  const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${points}&apikey=${apiKey}`, { next: { revalidate: interval === '1min' ? 60 : 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data?.values)) return null;
  return data.values.slice(0, points).reverse().map((item: any) => ({
    time: new Date(item.datetime).toISOString(),
    open: Number(item.open),
    high: Number(item.high),
    low: Number(item.low),
    close: Number(item.close)
  }));
}

export function getBondIncomePreview(symbol: string, quantity = 1) {
  const meta = getRussianAssetMeta(symbol);
  if (!meta || meta.type !== 'bond' || !meta.nominal || !meta.annualCouponPercent) {
    return null;
  }

  const annualIncome = (meta.nominal * meta.annualCouponPercent / 100) * quantity;
  return {
    quantity,
    monthly: Number((annualIncome / 12).toFixed(2)),
    semiAnnual: Number((annualIncome / 2).toFixed(2)),
    annual: Number(annualIncome.toFixed(2)),
    annualCouponPercent: meta.annualCouponPercent,
    nominal: meta.nominal,
    currency: meta.currency
  };
}

export async function getMarketQuote(symbol: string): Promise<MarketQuote> {
  const normalized = symbol.toUpperCase();
  try {
    if (provider === 'moex') {
      const quote = await fetchMoexQuote(normalized);
      if (quote) return quote;
    }
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

export async function getMarketCandles(symbol: string, options?: { interval?: MarketInterval; points?: number }): Promise<MarketCandle[]> {
  const normalized = symbol.toUpperCase();
  const interval = options?.interval ?? '1day';
  const points = options?.points ?? 30;
  try {
    if (provider === 'moex') {
      const candles = await fetchMoexCandles(normalized, interval, points);
      if (candles?.length) return candles;
    }
    if (provider === 'alphavantage') {
      const candles = await fetchAlphaVantageCandles(normalized, interval, points);
      if (candles?.length) return candles;
    }
    if (provider === 'twelvedata') {
      const candles = await fetchTwelveDataCandles(normalized, interval, points);
      if (candles?.length) return candles;
    }
  } catch {
    // fall back to demo
  }
  return demoCandles(normalized, points, interval);
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
