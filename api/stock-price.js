/**
 * Vercel Serverless Function - 取得股價
 * 路徑: /api/stock-price
 * 
 * 使用方式:
 * GET /api/stock-price?symbol=2330&date=2024-01-15
 * GET /api/stock-price?symbol=0050&latest=true
 */

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, date, latest } = req.query;

  // 驗證參數
  if (!symbol) {
    return res.status(400).json({ error: '缺少 symbol 參數' });
  }

  try {
    let price;

    if (latest === 'true') {
      // 取得最新股價
      price = await getLatestPrice(symbol);
    } else if (date) {
      // 取得歷史股價
      price = await getHistoricalPrice(symbol, date);
    } else {
      return res.status(400).json({ error: '請提供 date 或 latest 參數' });
    }

    if (price === null) {
      return res.status(404).json({ error: '無法取得股價' });
    }

    return res.status(200).json({
      symbol,
      date: date || new Date().toISOString().split('T')[0],
      price,
      source: 'yahoo_finance'
    });

  } catch (error) {
    console.error('API 錯誤:', error);
    return res.status(500).json({ error: '取得股價失敗' });
  }
}

/**
 * 取得歷史股價（Yahoo Finance）
 */
async function getHistoricalPrice(symbol, date) {
  try {
    const yahooSymbol = `${symbol}.TW`;
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    const endTimestamp = timestamp + 86400;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${timestamp}&period2=${endTimestamp}&interval=1d`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Yahoo Finance 請求失敗: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      console.error('Yahoo Finance 回應格式錯誤');
      return null;
    }

    const closePrice = data.chart.result[0].indicators.quote[0].close[0];

    if (closePrice === null || closePrice === undefined) {
      console.error('該日期無交易資料');
      return null;
    }

    return closePrice;

  } catch (error) {
    console.error('取得歷史股價失敗:', error);
    return null;
  }
}

/**
 * 取得最新股價（Yahoo Finance）
 */
async function getLatestPrice(symbol) {
  try {
    const yahooSymbol = `${symbol}.TW`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Yahoo Finance 請求失敗: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      console.error('Yahoo Finance 回應格式錯誤');
      return null;
    }

    const quotes = data.chart.result[0].indicators.quote[0].close;
    const closePrice = quotes[quotes.length - 1];

    if (closePrice === null || closePrice === undefined) {
      console.error('無最新股價資料');
      return null;
    }

    return closePrice;

  } catch (error) {
    console.error('取得最新股價失敗:', error);
    return null;
  }
}
