/**
 * 股票名稱轉代碼對照服務
 */

let stockNameMap = null;

/**
 * 載入股票名稱對照表
 */
export async function loadStockNameMap() {
  if (stockNameMap) {
    return stockNameMap;
  }

  try {
    const response = await fetch('/data/stock-name-map.json');
    stockNameMap = await response.json();
    return stockNameMap;
  } catch (error) {
    console.error('無法載入股票名稱對照表:', error);
    throw new Error('無法載入股票名稱對照表');
  }
}

/**
 * 將股票名稱轉換為代碼
 * @param {string} name - 股票名稱
 * @returns {string|null} 股票代碼，找不到則返回 null
 */
export function stockNameToCode(name) {
  if (!stockNameMap) {
    console.warn('股票名稱對照表尚未載入');
    return null;
  }

  // 移除空白
  const cleanName = name.trim();

  // 直接查找
  if (stockNameMap[cleanName]) {
    return stockNameMap[cleanName];
  }

  // 嘗試模糊匹配（去除「公司」、「股份有限公司」等後綴）
  const simplifiedName = cleanName
    .replace(/股份有限公司$/, '')
    .replace(/公司$/, '')
    .trim();

  if (stockNameMap[simplifiedName]) {
    return stockNameMap[simplifiedName];
  }

  return null;
}

/**
 * 批次轉換股票名稱
 * @param {string[]} names - 股票名稱陣列
 * @returns {Object} { found: [], notFound: [] }
 */
export function batchStockNameToCode(names) {
  const found = [];
  const notFound = [];

  names.forEach(name => {
    const code = stockNameToCode(name);
    if (code) {
      found.push({ name, code });
    } else {
      notFound.push(name);
    }
  });

  return { found, notFound };
}

/**
 * 驗證股票代碼格式
 * @param {string} code - 股票代碼
 * @returns {boolean}
 */
export function isValidStockCode(code) {
  // 台股代碼：4-6位數字，可能包含U（期貨）
  const pattern = /^\d{4,6}U?$/;
  return pattern.test(code);
}
