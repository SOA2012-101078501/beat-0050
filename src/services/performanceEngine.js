/**
 * 績效計算引擎
 * 計算用戶實際投資績效
 */

import { getStockPrice, getBatchLatestPrices } from './stockPriceAPI.js';
import priceCache from './priceCache.js';
import { TRANSACTION_TYPE } from '../utils/constants.js';

/**
 * 持倉追蹤器（FIFO）
 */
class PortfolioTracker {
  constructor() {
    // { symbol: [批次1, 批次2, ...] }
    this.holdings = {};
    this.totalInvested = 0;
    this.totalProceeds = 0;
  }

  /**
   * 買入股票
   * @param {string} symbol - 股票代碼
   * @param {number} quantity - 張數
   * @param {string} date - 日期
   * @param {number} cost - 總成本
   */
  buy(symbol, quantity, date, cost) {
    if (!this.holdings[symbol]) {
      this.holdings[symbol] = [];
    }

    this.holdings[symbol].push({
      quantity: quantity,
      date: date,
      costPerShare: cost / (quantity * 1000),  // 每股成本
      totalCost: cost
    });

    this.totalInvested += cost;
  }

  /**
   * 賣出股票（FIFO）
   * @param {string} symbol - 股票代碼
   * @param {number} quantity - 張數
   * @param {number} proceeds - 賣出所得
   * @returns {number} 賣出成本
   */
  sell(symbol, quantity, proceeds) {
    if (!this.holdings[symbol]) {
      console.warn(`嘗試賣出未持有的股票: ${symbol}`);
      return 0;
    }

    let remainingToSell = quantity;
    let totalCost = 0;

    while (remainingToSell > 0 && this.holdings[symbol].length > 0) {
      const batch = this.holdings[symbol][0];

      if (batch.quantity <= remainingToSell) {
        // 整批賣出
        totalCost += batch.totalCost;
        remainingToSell -= batch.quantity;
        this.holdings[symbol].shift();
      } else {
        // 部分賣出
        const sellRatio = remainingToSell / batch.quantity;
        totalCost += batch.totalCost * sellRatio;
        batch.quantity -= remainingToSell;
        batch.totalCost -= batch.totalCost * sellRatio;
        remainingToSell = 0;
      }
    }

    if (remainingToSell > 0) {
      console.warn(`賣出數量超過持有數量: ${symbol}, 超出 ${remainingToSell} 張`);
    }

    // 清除空的持股記錄
    if (this.holdings[symbol].length === 0) {
      delete this.holdings[symbol];
    }

    this.totalProceeds += proceeds;

    return totalCost;
  }

  /**
   * 取得當前持倉
   * @returns {Array} 持股列表
   */
  getCurrentHoldings() {
    const holdings = [];

    for (const [symbol, batches] of Object.entries(this.holdings)) {
      const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
      const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);

      if (totalQuantity > 0) {
        holdings.push({
          symbol: symbol,
          quantity: totalQuantity,
          avgCost: totalCost / (totalQuantity * 1000),  // 每股平均成本
          totalCost: totalCost
        });
      }
    }

    return holdings;
  }

  /**
   * 取得已實現損益
   * @returns {number}
   */
  getRealizedPL() {
    // 已實現損益 = 賣出所得 - (總投入 - 目前持股成本)
    const currentHoldingsCost = this.getCurrentHoldings()
      .reduce((sum, h) => sum + h.totalCost, 0);

    return this.totalProceeds - (this.totalInvested - currentHoldingsCost);
  }
}

/**
 * 計算用戶績效
 * @param {Array} transactions - 交易記錄
 * @returns {Promise<Object>} 績效結果
 */
export async function calculateUserPerformance(transactions) {
  console.log('開始計算用戶績效...');

  const portfolio = new PortfolioTracker();

  // 按日期排序
  const sortedTxns = [...transactions].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  // 處理每筆交易
  for (const txn of sortedTxns) {
    if (txn.type === TRANSACTION_TYPE.BUY) {
      portfolio.buy(txn.symbol, txn.quantity, txn.date, txn.amount);
    } else if (txn.type === TRANSACTION_TYPE.SELL) {
      portfolio.sell(txn.symbol, txn.quantity, txn.amount);
    }
  }

  // 取得當前持倉
  const currentHoldings = portfolio.getCurrentHoldings();

  // 取得最新股價
  console.log('正在取得最新股價...');
  const symbols = currentHoldings.map(h => h.symbol);
  const latestPrices = await getBatchLatestPrices(symbols);

  // 計算目前持股市值
  let currentValue = 0;
  const holdingsWithPrice = currentHoldings.map(holding => {
    const latestPrice = latestPrices[holding.symbol];

    if (!latestPrice) {
      console.warn(`無法取得 ${holding.symbol} 的最新股價`);
      return {
        ...holding,
        latestPrice: holding.avgCost,  // 使用平均成本作為備案
        marketValue: holding.totalCost,
        unrealizedPL: 0,
        unrealizedPLPercent: 0
      };
    }

    const marketValue = holding.quantity * latestPrice * 1000;
    const unrealizedPL = marketValue - holding.totalCost;
    const unrealizedPLPercent = (unrealizedPL / holding.totalCost) * 100;

    currentValue += marketValue;

    return {
      ...holding,
      latestPrice,
      marketValue,
      unrealizedPL,
      unrealizedPLPercent
    };
  });

  // 計算總損益
  const realizedPL = portfolio.getRealizedPL();
  const unrealizedPL = currentValue - currentHoldings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalPL = realizedPL + unrealizedPL;

  // 計算報酬率
  const returnRate = portfolio.totalInvested > 0
    ? (totalPL / portfolio.totalInvested) * 100
    : 0;

  console.log('用戶績效計算完成');

  return {
    totalInvested: portfolio.totalInvested,
    totalProceeds: portfolio.totalProceeds,
    currentValue: currentValue,
    realizedPL: realizedPL,
    unrealizedPL: unrealizedPL,
    totalPL: totalPL,
    returnRate: returnRate,
    holdings: holdingsWithPrice
  };
}
