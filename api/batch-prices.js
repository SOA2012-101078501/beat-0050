/**
 * Vercel Serverless Function - 批次取得股價
 * 路徑: /api/batch-prices
 * 
 * 使用方式:
 * POST /api/batch-prices
 * Body: { "requests": [{ "symbol": "2330", "date": "2024-01-15" }, ...] }
 */

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { requests } = req.body;

  if (!requests || !Array.isArray(requests)) {
    return res.status(400).json({ error: '請提供 requests 陣列' });
  }

  if (requests.length > 50) {
    return res.status(400).json({ error: '一次最多查詢 50 筆' });
  }

  try {
    const results = [];

    // 逐一處理請求（避免同時發送太多請求）
    for (const request of requests) {
      const { symbol, date, latest } = request;

      if (!symbol) {
        results.push({ symbol, error: '缺少 symbol' });
        continue;
      }

      try {
        let price;

        if (latest) {
          price = await getLatestPrice(symbol);
        } else if (date) {
          price = await getHistoricalPrice(symbol, date);
        } else {
          results.push({ symbol, error: '缺少 date 或 latest' });
          continue;
        }

        results.push({
          symbol,
          date: date || new Date().toISOString().split('T')[0],
          price,
          success: price !== null
        });

        // 延遲避免限流
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        results.push({ symbol, date, error: error.message });
      }
    }

    return res.status(200).json({ results });

  } catch (error) {
    console.error('批次 API 錯誤:', error);
    return res.status(500).json({ error: '批次取得股價失敗' });
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
      return null;
    }

    const data = await response.json();
    const closePrice = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.[0];

    return closePrice ?? null;

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
      return null;
    }

    const data = await response.json();
    const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    const closePrice = quotes?.[quotes.length - 1];

    return closePrice ?? null;

  } catch (error) {
    console.error('取得最新股價失敗:', error);
    return null;
  }
}
