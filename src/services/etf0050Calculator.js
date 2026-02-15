/**
 * 0050 對比計算服務
 * 模擬「如果這些錢都拿去買 0050」的績效
 */

import { get0050Price, get0050LatestPrice } from './stockPriceAPI.js';
import priceCache from './priceCache.js';
import { TRANSACTION_TYPE, FEE_RATES } from '../utils/constants.js';

/**
 * 0050 計算器
 */
class ETF0050Calculator {
  constructor() {
    this.holdings = [];      // 持倉批次
    this.totalInvested = 0;  // 總投入
    this.realizedPL = 0;     // 已實現損益
    this.anomalies = [];     // 異常交易記錄
  }

  /**
   * 處理買入交易
   * @param {string} date - 日期
   * @param {number} amount - 金額
   */
  async processBuy(date, amount) {
    // 嘗試從快取取得價格
    let price0050 = priceCache.get('0050', date);

    if (!price0050) {
      // 從 API 取得
      price0050 = await get0050Price(date);

      if (!price0050) {
        console.error(`無法取得 0050 在 ${date} 的股價`);
        throw new Error(`無法取得 0050 在 ${date} 的股價`);
      }

      // 儲存到快取
      priceCache.set('0050', date, price0050);
    }

    // 計算可買張數（含手續費）
    const shares = amount / (price0050 * 1000 * (1 + FEE_RATES.COMMISSION));

    // 記錄持倉
    this.holdings.push({
      date: date,
      quantity: shares,
      costPer1000: price0050 * 1000 * (1 + FEE_RATES.COMMISSION),
      totalCost: amount
    });

    this.totalInvested += amount;
  }

  /**
   * 處理賣出交易（FIFO + 極端情況處理）
   * @param {string} date - 日期
   * @param {number} amount - 賣出所得金額
   * @param {string} originalSymbol - 原始股票代碼（用於異常記錄）
   */
  async processSell(date, amount, originalSymbol) {
    // 取得當日 0050 股價
    let price0050 = priceCache.get('0050', date);

    if (!price0050) {
      price0050 = await get0050Price(date);

      if (!price0050) {
        console.error(`無法取得 0050 在 ${date} 的股價`);
        throw new Error(`無法取得 0050 在 ${date} 的股價`);
      }

      priceCache.set('0050', date, price0050);
    }

    // 計算需賣出張數（扣除手續費和交易稅）
    const sharesNeeded = amount / (price0050 * 1000 * (1 - FEE_RATES.COMMISSION - FEE_RATES.TAX));

    // 計算目前持有總張數
    const totalHolding = this.holdings.reduce((sum, h) => sum + h.quantity, 0);

    // 檢查極端情況
    if (sharesNeeded > totalHolding * 1.001) {  // 允許 0.1% 誤差
      // 記錄異常
      const deficit = sharesNeeded - totalHolding;
      const deficitAmount = deficit * price0050 * 1000;

      this.anomalies.push({
        date: date,
        originalSymbol: originalSymbol,
        userSellAmount: amount,
        etf0050HoldingValue: totalHolding * price0050 * 1000,
        deficit: deficitAmount
      });

      // 全部清倉
      const proceeds = this.sellAll(price0050);
      const cost = this.getTotalCostOfHoldings();
      this.realizedPL += (proceeds - cost);

      console.warn(`異常交易: ${date} 賣出金額超過 0050 持股，已全部清倉`);
      return;
    }

    // 正常情況：FIFO 賣出
    let remainingToSell = sharesNeeded;
    let totalCost = 0;

    while (remainingToSell > 0.00001 && this.holdings.length > 0) {  // 允許微小誤差
      const batch = this.holdings[0];

      if (batch.quantity <= remainingToSell) {
        // 整批賣出
        totalCost += batch.totalCost;
        remainingToSell -= batch.quantity;
        this.holdings.shift();
      } else {
        // 部分賣出
        const sellRatio = remainingToSell / batch.quantity;
        totalCost += batch.totalCost * sellRatio;
        batch.quantity -= remainingToSell;
        batch.totalCost -= batch.totalCost * sellRatio;
        remainingToSell = 0;
      }
    }

    // 計算已實現損益
    this.realizedPL += (amount - totalCost);
  }

  /**
   * 全部清倉
   * @param {number} price0050 - 0050 股價
   * @returns {number} 賣出所得
   */
  sellAll(price0050) {
    const totalShares = this.holdings.reduce((sum, h) => sum + h.quantity, 0);
    const proceeds = totalShares * price0050 * 1000 * (1 - FEE_RATES.COMMISSION - FEE_RATES.TAX);

    this.holdings = [];
    return proceeds;
  }

  /**
   * 取得目前持股的總成本
   * @returns {number}
   */
  getTotalCostOfHoldings() {
    return this.holdings.reduce((sum, h) => sum + h.totalCost, 0);
  }

  /**
   * 計算最終績效
   * @returns {Promise<Object>}
   */
  async calculateFinalPerformance() {
    // 取得最新 0050 股價
    const latestPrice = await get0050LatestPrice();

    if (!latestPrice) {
      throw new Error('無法取得 0050 最新股價');
    }

    // 計算目前持股市值
    const totalShares = this.holdings.reduce((sum, h) => sum + h.quantity, 0);
    const currentValue = totalShares * latestPrice * 1000;

    // 計算未實現損益
    const unrealizedPL = currentValue - this.getTotalCostOfHoldings();

    // 計算總損益
    const totalPL = this.realizedPL + unrealizedPL;

    // 計算報酬率
    const returnRate = this.totalInvested > 0
      ? (totalPL / this.totalInvested) * 100
      : 0;

    return {
      totalInvested: this.totalInvested,
      currentValue: currentValue,
      currentShares: totalShares,
      realizedPL: this.realizedPL,
      unrealizedPL: unrealizedPL,
      totalPL: totalPL,
      returnRate: returnRate,
      anomalies: this.anomalies
    };
  }
}

/**
 * 計算 0050 對比績效
 * @param {Array} transactions - 交易記錄
 * @returns {Promise<Object>} 0050 績效結果
 */
export async function calculate0050Performance(transactions) {
  console.log('開始計算 0050 對比績效...');

  const etf0050 = new ETF0050Calculator();

  // 按日期排序
  const sortedTxns = [...transactions].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  // 處理每筆交易
  for (const txn of sortedTxns) {
    try {
      if (txn.type === TRANSACTION_TYPE.BUY) {
        await etf0050.processBuy(txn.date, txn.amount);
      } else if (txn.type === TRANSACTION_TYPE.SELL) {
        await etf0050.processSell(txn.date, txn.amount, txn.symbol);
      }
    } catch (error) {
      console.error(`處理交易失敗 (${txn.date}, ${txn.symbol}):`, error);
      throw error;
    }
  }

  // 計算最終績效
  const result = await etf0050.calculateFinalPerformance();

  console.log('0050 對比績效計算完成');

  return result;
}
