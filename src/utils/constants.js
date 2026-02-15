// 交易類型
export const TRANSACTION_TYPE = {
  BUY: 'buy',
  SELL: 'sell',
};

// 費用率
export const FEE_RATES = {
  COMMISSION: 0.001425, // 手續費 0.1425%
  TAX: 0.003,           // 交易稅 0.3%
};

// 國泰證券 CSV 欄位名稱
export const CATHAY_CSV_COLUMNS = {
  STOCK_NAME: '股票名稱',
  DATE: '日期',
  SHARES: '股數',
  TRANSACTION_TYPE: '交易別',
  BUY_AMOUNT: '買進價金',
  SELL_AMOUNT: '賣出價金',
  FEE: '手續費',
  TAX: '交易稅',
};

// 圖表顏色
export const CHART_COLORS = {
  user: {
    line: '#5BE9B9',
    area: 'rgba(91, 233, 185, 0.1)',
  },
  etf0050: {
    line: '#94A3B8',
    area: 'rgba(148, 163, 184, 0.05)',
  },
  grid: '#F1F5F9',
  text: '#9CA3AF',
};

// 錯誤訊息
export const ERROR_MESSAGES = {
  INVALID_FILE_FORMAT: '檔案格式不正確，請上傳 CSV 檔案',
  MISSING_REQUIRED_FIELDS: '缺少必填欄位',
  STOCK_NOT_FOUND: '找不到股票代碼',
  INVALID_DATE: '日期格式錯誤',
  INVALID_NUMBER: '數字格式錯誤',
  API_ERROR: '無法取得股價資料，請稍後再試',
};
