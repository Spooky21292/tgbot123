import { db } from '@/lib/db';
import { getMarketQuote } from '@/lib/market-data';

export function getDemoStartingBalance() {
  const raw = Number(process.env.DEMO_TRADING_START_BALANCE ?? '100000');
  return Number.isFinite(raw) && raw > 0 ? raw : 100000;
}

export async function ensureDemoAccount(userId: string) {
  const initialBalance = getDemoStartingBalance();
  const existing = await db.demoAccount.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.demoAccount.create({
    data: { userId, balance: initialBalance, initialBalance, currency: 'USD' }
  });
}

export async function getTradingDashboard(userId: string, search?: string) {
  const account = await ensureDemoAccount(userId);
  const [positions, trades, assetPairs] = await Promise.all([
    db.position.findMany({ where: { accountId: account.id }, include: { asset: true }, orderBy: { updatedAt: 'desc' } }),
    db.trade.findMany({ where: { accountId: account.id }, include: { asset: true }, orderBy: { createdAt: 'desc' }, take: 12 }),
    db.asset.findMany({
      where: {
        isActive: true,
        ...(search ? { OR: [{ symbol: { contains: search } }, { name: { contains: search } }] } : {})
      },
      orderBy: { symbol: 'asc' }
    })
  ]);

  const uniqueSymbols = Array.from(new Set([...positions.map((position) => position.asset.symbol), ...assetPairs.map((asset) => asset.symbol)]));
  const quotes = Object.fromEntries(await Promise.all(uniqueSymbols.map(async (symbol) => [symbol, await getMarketQuote(symbol)])));

  const enrichedPositions = positions.map((position) => {
    const quote = quotes[position.asset.symbol];
    const marketValue = position.quantity * quote.price;
    const costBasis = position.quantity * position.averagePrice;
    const unrealizedPnl = marketValue - costBasis;
    return { position, quote, marketValue, costBasis, unrealizedPnl };
  });

  const investedAmount = enrichedPositions.reduce((sum, item) => sum + item.costBasis, 0);
  const portfolioValue = enrichedPositions.reduce((sum, item) => sum + item.marketValue, 0);
  const unrealizedPnl = enrichedPositions.reduce((sum, item) => sum + item.unrealizedPnl, 0);
  const equity = account.balance + portfolioValue;
  const totalPnl = equity - account.initialBalance;
  const totalReturn = account.initialBalance ? (totalPnl / account.initialBalance) * 100 : 0;

  const watchlist = assetPairs.map((asset) => ({ asset, quote: quotes[asset.symbol] }));

  return {
    account,
    watchlist,
    positions: enrichedPositions,
    trades,
    metrics: { investedAmount, portfolioValue, unrealizedPnl, equity, totalPnl, totalReturn }
  };
}

export async function getAssetTradingView(userId: string, symbol: string) {
  const account = await ensureDemoAccount(userId);
  const asset = await db.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset) return null;
  const [quote, position, trades] = await Promise.all([
    getMarketQuote(asset.symbol),
    db.position.findUnique({ where: { accountId_assetId: { accountId: account.id, assetId: asset.id } } }),
    db.trade.findMany({ where: { accountId: account.id, assetId: asset.id }, orderBy: { createdAt: 'desc' }, take: 10 })
  ]);
  const marketValue = position ? position.quantity * quote.price : 0;
  const costBasis = position ? position.quantity * position.averagePrice : 0;
  const unrealizedPnl = marketValue - costBasis;
  return { account, asset, quote, position, trades, marketValue, costBasis, unrealizedPnl };
}

export async function executeDemoTrade(input: { userId: string; symbol: string; side: string; quantity: number }) {
  const side = input.side.toUpperCase();
  if (!['BUY', 'SELL'].includes(side)) {
    return { ok: false as const, status: 400, error: 'Некорректная сторона сделки' };
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { ok: false as const, status: 400, error: 'Количество должно быть больше нуля' };
  }

  const account = await ensureDemoAccount(input.userId);
  const asset = await db.asset.findUnique({ where: { symbol: input.symbol.toUpperCase() } });
  if (!asset) return { ok: false as const, status: 404, error: 'Актив не найден' };

  const quote = await getMarketQuote(asset.symbol);
  const price = quote.price;
  const total = Number((price * input.quantity).toFixed(2));

  return db.$transaction(async (tx) => {
    const currentAccount = await tx.demoAccount.findUniqueOrThrow({ where: { id: account.id } });
    const currentPosition = await tx.position.findUnique({ where: { accountId_assetId: { accountId: account.id, assetId: asset.id } } });

    if (side === 'BUY') {
      if (currentAccount.balance < total) {
        return { ok: false as const, status: 400, error: 'Недостаточно виртуальных средств' };
      }
      const nextQuantity = (currentPosition?.quantity ?? 0) + input.quantity;
      const nextAverage = currentPosition
        ? ((currentPosition.quantity * currentPosition.averagePrice) + total) / nextQuantity
        : price;

      await tx.demoAccount.update({ where: { id: account.id }, data: { balance: currentAccount.balance - total } });
      if (currentPosition) {
        await tx.position.update({ where: { id: currentPosition.id }, data: { quantity: nextQuantity, averagePrice: nextAverage } });
      } else {
        await tx.position.create({ data: { accountId: account.id, assetId: asset.id, quantity: input.quantity, averagePrice: price } });
      }
      await tx.trade.create({ data: { accountId: account.id, assetId: asset.id, side, quantity: input.quantity, price, total, realizedPnl: 0 } });
      return { ok: true as const, status: 200, data: { price, total, balance: currentAccount.balance - total } };
    }

    if (!currentPosition || currentPosition.quantity < input.quantity) {
      return { ok: false as const, status: 400, error: 'Недостаточно количества актива для продажи' };
    }

    const remaining = currentPosition.quantity - input.quantity;
    const realizedPnl = Number(((price - currentPosition.averagePrice) * input.quantity).toFixed(2));
    await tx.demoAccount.update({ where: { id: account.id }, data: { balance: currentAccount.balance + total } });
    if (remaining <= 0) {
      await tx.position.delete({ where: { id: currentPosition.id } });
    } else {
      await tx.position.update({ where: { id: currentPosition.id }, data: { quantity: remaining } });
    }
    await tx.trade.create({ data: { accountId: account.id, assetId: asset.id, side, quantity: input.quantity, price, total, realizedPnl } });
    return { ok: true as const, status: 200, data: { price, total, balance: currentAccount.balance + total, realizedPnl } };
  });
}

export async function resetDemoAccount(userId: string) {
  const account = await ensureDemoAccount(userId);
  const initialBalance = getDemoStartingBalance();
  await db.$transaction([
    db.trade.deleteMany({ where: { accountId: account.id } }),
    db.position.deleteMany({ where: { accountId: account.id } }),
    db.demoAccount.update({ where: { id: account.id }, data: { balance: initialBalance, initialBalance } })
  ]);
  return db.demoAccount.findUniqueOrThrow({ where: { id: account.id } });
}
