import { db } from '@/lib/db';
import { getMarketQuote } from '@/lib/market-data';

function getTradingModels() {
  const prisma = db as unknown as {
    demoAccount?: any;
    asset?: any;
    position?: any;
    trade?: any;
    $transaction: typeof db.$transaction;
  };

  if (!prisma.demoAccount || !prisma.asset || !prisma.position || !prisma.trade) {
    return null;
  }

  return prisma;
}

export function isDemoTradingReady() {
  return Boolean(getTradingModels());
}

function createTradingNotReadyError() {
  return new Error('DEMO_TRADING_NOT_READY');
}

function createTradingUserNotFoundError() {
  return new Error('DEMO_TRADING_USER_NOT_FOUND');
}

export function getDemoStartingBalance() {
  const raw = Number(process.env.DEMO_TRADING_START_BALANCE ?? '1000000');
  return Number.isFinite(raw) && raw > 0 ? raw : 1000000;
}

export async function ensureDemoAccount(userId: string) {
  const prisma = getTradingModels();
  if (!prisma) throw createTradingNotReadyError();

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw createTradingUserNotFoundError();

  const initialBalance = getDemoStartingBalance();
  const existing = await prisma.demoAccount.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.demoAccount.create({
    data: { userId, balance: initialBalance, initialBalance, currency: 'RUB' }
  });
}

export async function getTradingDashboard(userId: string, search?: string, assetType?: string, page = 1) {
  const prisma = getTradingModels();
  if (!prisma) throw createTradingNotReadyError();

  const account = await ensureDemoAccount(userId);
  const watchlistPageSize = 10;
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const assetFilter = assetType && ['stock', 'bond'].includes(assetType) ? assetType : undefined;
  const assetWhere = {
    isActive: true,
    ...(assetFilter ? { type: assetFilter } : {}),
    ...(search ? { OR: [{ symbol: { contains: search } }, { name: { contains: search } }] } : {})
  };

  const [positions, trades, assetPairs, watchlistCount] = await Promise.all([
    prisma.position.findMany({ where: { accountId: account.id }, include: { asset: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.trade.findMany({ where: { accountId: account.id }, include: { asset: true }, orderBy: { createdAt: 'desc' }, take: 12 }),
    prisma.asset.findMany({
      where: assetWhere,
      orderBy: { symbol: 'asc' },
      skip: (safePage - 1) * watchlistPageSize,
      take: watchlistPageSize
    }),
    prisma.asset.count({ where: assetWhere })
  ]);

  const uniqueSymbols = Array.from(new Set([...positions.map((position: any) => position.asset.symbol), ...assetPairs.map((asset: any) => asset.symbol)]));
  const quotes = Object.fromEntries(await Promise.all(uniqueSymbols.map(async (symbol) => [symbol, await getMarketQuote(symbol)])));

  const enrichedPositions = positions.map((position: any) => {
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

  const watchlist = assetPairs.map((asset: any) => ({ asset, quote: quotes[asset.symbol] }));

  return {
    account,
    watchlist,
    watchlistPagination: {
      page: safePage,
      pageSize: watchlistPageSize,
      total: watchlistCount,
      pageCount: Math.max(1, Math.ceil(watchlistCount / watchlistPageSize)),
      assetType: assetFilter ?? 'all'
    },
    positions: enrichedPositions,
    trades,
    metrics: { investedAmount, portfolioValue, unrealizedPnl, equity, totalPnl, totalReturn }
  };
}

export async function getAssetTradingView(userId: string, symbol: string) {
  const prisma = getTradingModels();
  if (!prisma) throw createTradingNotReadyError();

  const account = await ensureDemoAccount(userId);
  const asset = await prisma.asset.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!asset) return null;
  const [quote, position, trades] = await Promise.all([
    getMarketQuote(asset.symbol),
    prisma.position.findUnique({ where: { accountId_assetId: { accountId: account.id, assetId: asset.id } } }),
    prisma.trade.findMany({ where: { accountId: account.id, assetId: asset.id }, orderBy: { createdAt: 'desc' }, take: 10 })
  ]);
  const marketValue = position ? position.quantity * quote.price : 0;
  const costBasis = position ? position.quantity * position.averagePrice : 0;
  const unrealizedPnl = marketValue - costBasis;
  return { account, asset, quote, position, trades, marketValue, costBasis, unrealizedPnl };
}

export async function executeDemoTrade(input: { userId: string; symbol: string; side: string; quantity: number }) {
  const prisma = getTradingModels();
  if (!prisma) throw createTradingNotReadyError();

  const side = input.side.toUpperCase();
  if (!['BUY', 'SELL'].includes(side)) {
    return { ok: false as const, status: 400, error: 'Некорректная сторона сделки' };
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { ok: false as const, status: 400, error: 'Количество должно быть больше нуля' };
  }

  const account = await ensureDemoAccount(input.userId);
  const asset = await prisma.asset.findUnique({ where: { symbol: input.symbol.toUpperCase() } });
  if (!asset) return { ok: false as const, status: 404, error: 'Актив не найден' };

  const quote = await getMarketQuote(asset.symbol);
  const price = quote.price;
  const total = Number((price * input.quantity).toFixed(2));

  return prisma.$transaction(async (tx: any) => {
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
  const prisma = getTradingModels();
  if (!prisma) throw createTradingNotReadyError();

  const account = await ensureDemoAccount(userId);
  const initialBalance = getDemoStartingBalance();
  await prisma.$transaction([
    prisma.trade.deleteMany({ where: { accountId: account.id } }),
    prisma.position.deleteMany({ where: { accountId: account.id } }),
    prisma.demoAccount.update({ where: { id: account.id }, data: { balance: initialBalance, initialBalance } })
  ]);
  return prisma.demoAccount.findUniqueOrThrow({ where: { id: account.id } });
}

export function getDemoTradingErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message === 'DEMO_TRADING_NOT_READY') {
    return 'Торговые модели Prisma ещё не инициализированы. Выполните npm run db:generate, затем npm run db:push и npm run db:seed.';
  }

  if (message === 'DEMO_TRADING_USER_NOT_FOUND') {
    return 'Текущая сессия ссылается на пользователя, которого уже нет в базе данных. Обычно это происходит после db push/db seed или пересоздания базы. Выйдите из аккаунта и войдите снова; если аккаунт тестовый, используйте seeded-пользователя или зарегистрируйтесь заново.';
  }

  return message || 'Неизвестная ошибка';
}
