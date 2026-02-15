/**
 * 股價 API 服務
 * 混合使用策略：
 * 1. 優先使用台灣證交所 API（100% 免費，永久）
 * 2. 失敗時使用 Yahoo Finance API（目前免費，備援）
 */

import { getTWSEStockPrice, getTWSELatestPrice, getTWSE0050Price } from './twseAPI.js';

/**
 * 將日期轉換為 Unix timestamp
 * @param {string} dateStr - 日期字串 (YYYY-MM-DD)
 * @returns {number} Unix timestamp (秒)
 */
function dateToTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

/**
 * 取得台股股價（混合策略）
 * @param {string} symbol - 股票代碼
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
export async function getStockPrice(symbol, date) {
  // 策略 1：優先使用證交所 API（100% 免費）
  try {
    console.log(`[證交所] 取得 ${symbol} 在 ${date} 的股價...`);
    const price = await getTWSEStockPrice(symbol, date);
    
    if (price) {
      console.log(`[證交所] ✓ 成功取得 ${symbol}: ${price}`);
      return price;
    }
  } catch (error) {
    console.warn(`[證交所] 失敗，切換到 Yahoo Finance:`, error);
  }
  
  // 策略 2：備援使用 Yahoo Finance
  try {
    console.log(`[Yahoo] 備援取得 ${symbol} 在 ${date} 的股價...`);
    const price = await getYahooFinancePrice(symbol, date);
    
    if (price) {
      console.log(`[Yahoo] ✓ 成功取得 ${symbol}: ${price}`);
    }
    
    return price;
  } catch (error) {
    console.error(`[Yahoo] 也失敗了:`, error);
    return null;
  }
}

/**
 * Yahoo Finance API（備援用）
 * ⚠️ 注意：此 API 目前免費，但未來可能改變政策
 * @param {string} symbol - 股票代碼
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
async function getYahooFinancePrice(symbol, date) {
  try {
    // Yahoo Finance 台股代碼格式：2330.TW
    const yahooSymbol = `${symbol}.TW`;
    
    const startTimestamp = dateToTimestamp(date);
    const endTimestamp = startTimestamp + 86400; // +1 天
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}` +
      `?period1=${startTimestamp}` +
      `&period2=${endTimestamp}` +
      `&interval=1d`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`無法取得 ${symbol} 在 ${date} 的股價`);
      return null;
    }
    
    const data = await response.json();
    
    // 檢查資料結構
    if (!data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      console.warn(`${symbol} 在 ${date} 無股價資料`);
      return null;
    }
    
    const closePrice = data.chart.result[0].indicators.quote[0].close[0];
    
    // 如果當天沒有交易（假日），取最近一個交易日
    if (closePrice === null || closePrice === undefined) {
      console.warn(`${symbol} 在 ${date} 未交易（可能為假日）`);
      return null;
    }
    
    return closePrice;
  } catch (error) {
    console.error(`取得股價失敗 (${symbol}, ${date}):`, error);
    return null;
  }
}

/**
 * 取得最新股價（混合策略）
 * @param {string} symbol - 股票代碼
 * @returns {Promise<number|null>} 最新收盤價
 */
export async function getLatestStockPrice(symbol) {
  // 策略 1：優先使用證交所
  try {
    const price = await getTWSELatestPrice(symbol);
    if (price) {
      console.log(`[證交所] ✓ 取得 ${symbol} 最新價格: ${price}`);
      return price;
    }
  } catch (error) {
    console.warn(`[證交所] 最新價格失敗，切換到 Yahoo`);
  }
  
  // 策略 2：備援使用 Yahoo Finance
  try {
    const price = await getYahooFinanceLatestPrice(symbol);
    if (price) {
      console.log(`[Yahoo] ✓ 取得 ${symbol} 最新價格: ${price}`);
    }
    return price;
  } catch (error) {
    console.error(`兩個 API 都失敗:`, error);
    return null;
  }
}

/**
 * Yahoo Finance 最新價格（備援）
 * @param {string} symbol - 股票代碼
 * @returns {Promise<number|null>}
 */
async function getYahooFinanceLatestPrice(symbol) {
  try {
    const yahooSymbol = `${symbol}.TW`;
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}` +
      `?interval=1d&range=1d`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`無法取得 ${symbol} 的最新股價`);
      return null;
    }
    
    const data = await response.json();
    
    const quotes = data.chart.result[0].indicators.quote[0];
    const closePrice = quotes.close[quotes.close.length - 1];
    
    return closePrice;
  } catch (error) {
    console.error(`取得最新股價失敗 (${symbol}):`, error);
    return null;
  }
}

/**
 * 批次取得多個股票的最新價格
 * @param {string[]} symbols - 股票代碼陣列
 * @returns {Promise<Object>} { symbol: price }
 */
export async function getBatchLatestPrices(symbols) {
  const prices = {};
  
  // 避免同時發送太多請求，每次處理 5 個
  const batchSize = 5;
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(symbol => getLatestStockPrice(symbol))
    );
    
    batch.forEach((symbol, index) => {
      prices[symbol] = results[index];
    });
    
    // 稍微延遲，避免 API 限流
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return prices;
}

/**
 * 取得 0050 的價格（混合策略：靜態檔案 → 證交所 → Yahoo）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
export async function get0050Price(date) {
  try {
    // 策略 1：優先從靜態檔案讀取（最快，無 API 成本）
    const history = await load0050History();
    
    if (history && history[date]) {
      console.log(`[靜態檔案] ✓ 取得 0050 在 ${date} 的價格: ${history[date]}`);
      return history[date];
    }
    
    // 策略 2：證交所 API（100% 免費）
    const twsePrice = await getTWSE0050Price(date);
    if (twsePrice) {
      console.log(`[證交所] ✓ 取得 0050 在 ${date} 的價格: ${twsePrice}`);
      return twsePrice;
    }
    
    // 策略 3：Yahoo Finance（備援）
    console.log(`[Yahoo] 備援取得 0050 在 ${date} 的價格...`);
    return await getYahooFinancePrice('0050', date);
  } catch (error) {
    console.error('取得 0050 股價失敗:', error);
    return null;
  }
}

/**
 * 載入 0050 歷史股價（從靜態檔案）
 * @returns {Promise<Object|null>} { "YYYY-MM-DD": price }
 */
let cached0050History = null;

async function load0050History() {
  if (cached0050History) {
    return cached0050History;
  }
  
  try {
    const response = await fetch('/data/0050-history.json');
    
    if (!response.ok) {
      console.warn('0050 歷史資料檔案不存在，將使用 API');
      return null;
    }
    
    cached0050History = await response.json();
    console.log('已載入 0050 歷史股價資料');
    return cached0050History;
  } catch (error) {
    console.warn('載入 0050 歷史資料失敗:', error);
    return null;
  }
}

/**
 * 取得 0050 最新股價
 * @returns {Promise<number|null>}
 */
export async function get0050LatestPrice() {
  return await getLatestStockPrice('0050');
}
