/**
 * Vercel Serverless Function - 驗證資料範圍
 * 路徑: /api/data-info
 * 
 * 回傳可用的資料範圍資訊
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 0050 上市日期
    const ETF0050_LISTING_DATE = '2003-06-30';
    
    // 測試幾個關鍵日期的資料可用性
    const testDates = [
      '2003-06-30', // 上市首日
      '2020-01-02', // 2020年初
      '2024-01-02', // 2024年初
    ];

    const availability = {};

    for (const date of testDates) {
      const price = await testDataAvailability('0050', date);
      availability[date] = {
        available: price !== null,
        price: price
      };
    }

    return res.status(200).json({
      symbol: '0050',
      name: '元大台灣50',
      listingDate: ETF0050_LISTING_DATE,
      dataSource: 'Yahoo Finance',
      coverage: {
        start: ETF0050_LISTING_DATE,
        end: new Date().toISOString().split('T')[0],
        note: '理論上從上市日開始有完整資料'
      },
      tested: availability,
      recommendations: {
        minDate: ETF0050_LISTING_DATE,
        maxDate: new Date().toISOString().split('T')[0],
        note: '建議使用 2003-06-30 之後的交易記錄'
      }
    });

  } catch (error) {
    console.error('資料範圍查詢錯誤:', error);
    return res.status(500).json({ error: '查詢失敗' });
  }
}

/**
 * 測試特定日期的資料可用性
 */
async function testDataAvailability(symbol, date) {
  try {
    const yahooSymbol = `${symbol}.TW`;
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    const endTimestamp = timestamp + 86400;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${timestamp}&period2=${endTimestamp}&interval=1d`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const closePrice = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.[0];

    return closePrice ?? null;

  } catch (error) {
    return null;
  }
}
