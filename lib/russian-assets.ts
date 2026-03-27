export type RussianAssetDefinition = {
  symbol: string;
  name: string;
  type: 'stock' | 'bond';
  board: 'TQBR' | 'TQOB';
  market: 'shares' | 'bonds';
  currency: 'RUB';
  nominal?: number;
  annualCouponPercent?: number;
  basePrice: number;
};

export const RUSSIAN_ASSETS: RussianAssetDefinition[] = [
  { symbol: 'SBER', name: 'Сбербанк ао', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 318.4 },
  { symbol: 'GAZP', name: 'Газпром', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 168.3 },
  { symbol: 'LKOH', name: 'ЛУКОЙЛ', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 5810.5 },
  { symbol: 'ROSN', name: 'Роснефть', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 548.2 },
  { symbol: 'NVTK', name: 'НОВАТЭК', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 1116.4 },
  { symbol: 'GMKN', name: 'ГМК Норникель', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 145.7 },
  { symbol: 'MGNT', name: 'Магнит', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 8120 },
  { symbol: 'MTSS', name: 'МТС', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 289.4 },
  { symbol: 'VTBR', name: 'ВТБ', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 0.025 },
  { symbol: 'ALRS', name: 'АЛРОСА', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 76.5 },
  { symbol: 'PHOR', name: 'ФосАгро', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 6448 },
  { symbol: 'MAGN', name: 'ММК', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 50.1 },
  { symbol: 'SNGS', name: 'Сургутнефтегаз ао', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 28.6 },
  { symbol: 'CHMF', name: 'Северсталь', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 1715 },
  { symbol: 'IRAO', name: 'Интер РАО', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 4.15 },
  { symbol: 'TATN', name: 'Татнефть ао', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 705.3 },
  { symbol: 'TRNFP', name: 'Транснефть-п', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 1435 },
  { symbol: 'AFKS', name: 'АФК Система', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 18.8 },
  { symbol: 'MOEX', name: 'Московская биржа', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 228.6 },
  { symbol: 'RUAL', name: 'РУСАЛ', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 39.4 },
  { symbol: 'FLOT', name: 'Совкомфлот', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 96.2 },
  { symbol: 'POSI', name: 'Группа Позитив', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 2895 },
  { symbol: 'HEAD', name: 'HeadHunter', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 4120 },
  { symbol: 'OZON', name: 'Ozon Holdings PLC', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 3610 },
  { symbol: 'YDEX', name: 'Яндекс', type: 'stock', board: 'TQBR', market: 'shares', currency: 'RUB', basePrice: 3924 },

  { symbol: 'SU26207RMFS9', name: 'ОФЗ 26207', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 8.15, basePrice: 846.4 },
  { symbol: 'SU26212RMFS9', name: 'ОФЗ 26212', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.05, basePrice: 782.8 },
  { symbol: 'SU26215RMFS2', name: 'ОФЗ 26215', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.0, basePrice: 795.6 },
  { symbol: 'SU26218RMFS6', name: 'ОФЗ 26218', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 8.5, basePrice: 884.1 },
  { symbol: 'SU26221RMFS0', name: 'ОФЗ 26221', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.7, basePrice: 811.2 },
  { symbol: 'SU26224RMFS4', name: 'ОФЗ 26224', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 6.9, basePrice: 742.5 },
  { symbol: 'SU26227RMFS7', name: 'ОФЗ 26227', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.4, basePrice: 768.9 },
  { symbol: 'SU26230RMFS1', name: 'ОФЗ 26230', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.95, basePrice: 801.3 },
  { symbol: 'SU26233RMFS5', name: 'ОФЗ 26233', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.2, basePrice: 775.4 },
  { symbol: 'SU26236RMFS8', name: 'ОФЗ 26236', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 8.1, basePrice: 812.7 },
  { symbol: 'SU26238RMFS4', name: 'ОФЗ 26238', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.1, basePrice: 583.2 },
  { symbol: 'SU26240RMFS0', name: 'ОФЗ 26240', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 7.65, basePrice: 721.8 },
  { symbol: 'SU26241RMFS8', name: 'ОФЗ 26241', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 9.5, basePrice: 635.9 },
  { symbol: 'SU26242RMFS6', name: 'ОФЗ 26242', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 9.1, basePrice: 628.5 },
  { symbol: 'SU26243RMFS4', name: 'ОФЗ 26243', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 9.8, basePrice: 646.8 },
  { symbol: 'SU26244RMFS2', name: 'ОФЗ 26244', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 11.25, basePrice: 703.4 },
  { symbol: 'SU26245RMFS9', name: 'ОФЗ 26245', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 12.1, basePrice: 845.1 },
  { symbol: 'SU26246RMFS7', name: 'ОФЗ 26246', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 12.0, basePrice: 868.4 },
  { symbol: 'SU26247RMFS5', name: 'ОФЗ 26247', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 12.2, basePrice: 892.6 },
  { symbol: 'SU26248RMFS3', name: 'ОФЗ 26248', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 12.25, basePrice: 912.5 },
  { symbol: 'SU26249RMFS1', name: 'ОФЗ 26249', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 12.0, basePrice: 918.9 },
  { symbol: 'SU26250RMFS9', name: 'ОФЗ 26250', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 11.9, basePrice: 906.7 },
  { symbol: 'SU29006RMFS2', name: 'ОФЗ-ПК 29006', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 14.4, basePrice: 1001.4 },
  { symbol: 'SU29010RMFS4', name: 'ОФЗ-ПК 29010', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 14.2, basePrice: 998.7 },
  { symbol: 'SU29014RMFS6', name: 'ОФЗ-ПК 29014', type: 'bond', board: 'TQOB', market: 'bonds', currency: 'RUB', nominal: 1000, annualCouponPercent: 13.9, basePrice: 997.3 }
];
