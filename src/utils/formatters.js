/**
 * 格式化金額
 * @param {number} amount - 金額
 * @param {boolean} showSign - 是否顯示正負號
 * @returns {string}
 */
export function formatCurrency(amount, showSign = false) {
  const formatted = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }

  return formatted;
}

/**
 * 格式化百分比
 * @param {number} value - 數值
 * @param {number} decimals - 小數位數
 * @param {boolean} showSign - 是否顯示正負號
 * @returns {string}
 */
export function formatPercentage(value, decimals = 2, showSign = true) {
  const formatted = value.toFixed(decimals);
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  }

  return `${formatted}%`;
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY/MM/DD') {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 轉換日期格式
 * 2024/01/15 → 2024-01-15
 * @param {string} dateStr - 日期字串
 * @returns {string}
 */
export function convertDateFormat(dateStr) {
  if (!dateStr) return '';
  
  // 移除可能的空白
  dateStr = dateStr.trim();
  
  // 處理 2024/01/15 格式
  if (dateStr.includes('/')) {
    return dateStr.replace(/\//g, '-');
  }
  
  // 處理 20240115 格式
  if (dateStr.length === 8 && !dateStr.includes('-')) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  
  return dateStr;
}

/**
 * 格式化股數（股轉張）
 * @param {number} shares - 股數
 * @returns {number} 張數
 */
export function sharesToLots(shares) {
  return shares / 1000;
}

/**
 * 格式化張數顯示
 * @param {number} lots - 張數
 * @param {number} decimals - 小數位數
 * @returns {string}
 */
export function formatLots(lots, decimals = 2) {
  return `${lots.toFixed(decimals)}張`;
}
