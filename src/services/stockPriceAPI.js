/**
 * 股價 API 服務（使用後端 API）
 * 透過 Vercel Serverless Function 取得真實股價
 * 100% 免費，無 CORS 問題
 */

// API 基礎 URL（生產環境會自動使用正確的域名）
const API_BASE_URL = '';

/**
 * 取得台股股價
 * @param {string} symbol - 股票代碼
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
export async function getStockPrice(symbol, date) {
  console.log(`[API] 取得 ${symbol} 在 ${date} 的股價...`);
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock-price?symbol=${symbol}&date=${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`API 請求失敗: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.price) {
      console.log(`[API] ✓ ${symbol} 價格: ${data.price.toFixed(2)}`);
      return data.price;
    }

    return null;

  } catch (error) {
    console.error(`API 錯誤:`, error);
    return null;
  }
}

/**
 * 取得最新股價
 * @param {string} symbol - 股票代碼
 * @returns {Promise<number|null>} 最新收盤價
 */
export async function getLatestStockPrice(symbol) {
  console.log(`[API] 取得 ${symbol} 最新股價...`);
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stock-price?symbol=${symbol}&latest=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`API 請求失敗: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.price) {
      console.log(`[API] ✓ ${symbol} 最新價格: ${data.price.toFixed(2)}`);
      return data.price;
    }

    return null;

  } catch (error) {
    console.error(`API 錯誤:`, error);
    return null;
  }
}

/**
 * 批次取得多個股票的最新價格
 * @param {string[]} symbols - 股票代碼陣列
 * @returns {Promise<Object>} { symbol: price }
 */
export async function getBatchLatestPrices(symbols) {
  console.log(`[API] 批次取得 ${symbols.length} 檔股票最新價格...`);
  
  try {
    // 準備批次請求
    const requests = symbols.map(symbol => ({
      symbol,
      latest: true
    }));

    const response = await fetch(`${API_BASE_URL}/api/batch-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests })
    });

    if (!response.ok) {
      console.warn(`批次 API 請求失敗: ${response.status}`);
      // 降級：逐一查詢
      return await fallbackGetPrices(symbols);
    }

    const data = await response.json();
    const prices = {};

    data.results.forEach(result => {
      if (result.success && result.price) {
        prices[result.symbol] = result.price;
      } else {
        prices[result.symbol] = null;
      }
    });

    console.log(`[API] ✓ 完成取得 ${symbols.length} 檔股票價格`);
    return prices;

  } catch (error) {
    console.error(`批次 API 錯誤:`, error);
    // 降級：逐一查詢
    return await fallbackGetPrices(symbols);
  }
}

/**
 * 降級方案：逐一查詢
 */
async function fallbackGetPrices(symbols) {
  console.log('[API] 使用降級方案：逐一查詢');
  const prices = {};
  
  for (const symbol of symbols) {
    prices[symbol] = await getLatestStockPrice(symbol);
    // 延遲避免限流
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return prices;
}

/**
 * 取得 0050 的價格
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
export async function get0050Price(date) {
  console.log(`[API] 取得 0050 在 ${date} 的價格...`);
  
  // 直接使用 API
  return await getStockPrice('0050', date);
}

/**
 * 取得 0050 最新股價
 * @returns {Promise<number|null>}
 */
export async function get0050LatestPrice() {
  console.log('[API] 取得 0050 最新股價...');
  return await getLatestStockPrice('0050');
}
