/**
 * 台灣證交所 API 服務
 * 100% 免費，官方公開資料
 * 網址：https://www.twse.com.tw/
 */

/**
 * 取得台股個股日成交資訊
 * @param {string} symbol - 股票代碼
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>} 收盤價
 */
export async function getTWSEStockPrice(symbol, date) {
  try {
    // 轉換日期格式：2024-01-15 → 20240115
    const dateStr = date.replace(/-/g, '');
    
    // 證交所 API 使用民國年月格式（如：11301 代表 2024年1月）
    const year = parseInt(dateStr.substring(0, 4)) - 1911;
    const month = dateStr.substring(4, 6);
    const dateParam = `${year}${month}`;
    
    // 證交所個股日成交資訊 API
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY` +
      `?response=json&date=${dateParam}01&stockNo=${symbol}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`證交所 API 請求失敗: ${symbol}`);
      return null;
    }
    
    const data = await response.json();
    
    // 檢查回應狀態
    if (data.stat !== 'OK' || !data.data) {
      console.warn(`證交所無 ${symbol} 資料`);
      return null;
    }
    
    // 找到對應日期的資料
    // data.data 格式: [["113/01/15", "1,234", "1,245", ...], ...]
    const targetDate = formatROCDate(date);
    const record = data.data.find(row => row[0] === targetDate);
    
    if (!record) {
      console.warn(`${symbol} 在 ${date} 無交易資料`);
      return null;
    }
    
    // 收盤價在第 6 個欄位（index 6）
    const closePriceStr = record[6];
    const closePrice = parseFloat(closePriceStr.replace(/,/g, ''));
    
    if (isNaN(closePrice)) {
      console.warn(`${symbol} 收盤價格式錯誤: ${closePriceStr}`);
      return null;
    }
    
    return closePrice;
  } catch (error) {
    console.error(`證交所 API 錯誤 (${symbol}, ${date}):`, error);
    return null;
  }
}

/**
 * 取得 0050 的價格（證交所）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<number|null>}
 */
export async function getTWSE0050Price(date) {
  return await getTWSEStockPrice('0050', date);
}

/**
 * 將西元日期轉為民國日期格式
 * 2024-01-15 → 113/01/15
 * @param {string} date - 西元日期 (YYYY-MM-DD)
 * @returns {string} 民國日期
 */
function formatROCDate(date) {
  const [year, month, day] = date.split('-');
  const rocYear = parseInt(year) - 1911;
  return `${rocYear}/${month}/${day}`;
}

/**
 * 批次取得多檔股票的價格
 * @param {string[]} symbols - 股票代碼陣列
 * @param {string} date - 日期
 * @returns {Promise<Object>} { symbol: price }
 */
export async function getTWSEBatchPrices(symbols, date) {
  const prices = {};
  
  // 證交所 API 需要逐一查詢，避免同時發送太多請求
  for (const symbol of symbols) {
    const price = await getTWSEStockPrice(symbol, date);
    prices[symbol] = price;
    
    // 延遲避免限流（證交所建議間隔 3 秒）
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return prices;
}

/**
 * 取得最新股價（證交所當日盤中資訊）
 * @param {string} symbol - 股票代碼
 * @returns {Promise<number|null>}
 */
export async function getTWSELatestPrice(symbol) {
  try {
    // 使用證交所當日盤中資訊 API
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${symbol}.tw`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.msgArray || data.msgArray.length === 0) {
      return null;
    }
    
    const stockData = data.msgArray[0];
    
    // 收盤價優先，如果沒有則用成交價
    const price = parseFloat(stockData.z || stockData.c);
    
    return isNaN(price) ? null : price;
  } catch (error) {
    console.error(`證交所最新價格錯誤 (${symbol}):`, error);
    return null;
  }
}
