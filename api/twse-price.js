/**
 * Vercel Serverless Function - 證交所股價代理
 * 路徑: /api/twse-price
 * 
 * 使用方式:
 * GET /api/twse-price?symbol=2330&date=2024-01-15
 */

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { symbol, date } = req.query;

  if (!symbol || !date) {
    return res.status(400).json({ error: '缺少 symbol 或 date 參數' });
  }

  try {
    const price = await getTWSEPrice(symbol, date);

    if (price === null) {
      return res.status(404).json({ 
        error: '無法取得股價',
        symbol,
        date,
        note: '可能是假日或該股票代碼不存在'
      });
    }

    return res.status(200).json({
      symbol,
      date,
      price,
      source: 'twse',
      currency: 'TWD'
    });

  } catch (error) {
    console.error('證交所 API 錯誤:', error);
    return res.status(500).json({ error: '取得股價失敗' });
  }
}

/**
 * 從證交所取得股價
 */
async function getTWSEPrice(symbol, date) {
  try {
    // 解析日期
    const dateObj = new Date(date);
    const year = dateObj.getFullYear() - 1911; // 轉民國年
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    // 證交所 API URL
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${year}${month}01&stockNo=${symbol}`;

    console.log('查詢證交所:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('證交所回應錯誤:', response.status);
      return null;
    }

    const data = await response.json();

    // 檢查回應
    if (data.stat !== 'OK' || !data.data) {
      console.error('證交所無資料');
      return null;
    }

    // 找到對應日期的資料
    const targetDate = `${year}/${month}/${day}`;
    const record = data.data.find(row => row[0] === targetDate);

    if (!record) {
      console.error('找不到該日期:', targetDate);
      return null;
    }

    // 收盤價在第 6 個欄位
    const closePriceStr = record[6];
    const closePrice = parseFloat(closePriceStr.replace(/,/g, ''));

    if (isNaN(closePrice)) {
      console.error('價格格式錯誤:', closePriceStr);
      return null;
    }

    console.log(`✓ 證交所 ${symbol} ${date}: ${closePrice}`);
    return closePrice;

  } catch (error) {
    console.error('證交所查詢失敗:', error);
    return null;
  }
}
