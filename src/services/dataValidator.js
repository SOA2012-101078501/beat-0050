/**
 * 資料驗證與去重服務
 */

/**
 * 移除重複的交易記錄
 * 重複判定：日期 + 股票代碼 + 買賣別 + 數量 + 金額 完全相同
 * @param {Array} transactions - 交易記錄陣列
 * @returns {Object} { transactions, duplicateCount }
 */
export function removeDuplicates(transactions) {
  const uniqueMap = new Map();
  
  transactions.forEach(txn => {
    // 產生唯一鍵
    const key = `${txn.date}_${txn.symbol}_${txn.type}_${txn.quantity}_${txn.amount}`;
    
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, txn);
    }
  });
  
  const uniqueTransactions = Array.from(uniqueMap.values());
  const duplicateCount = transactions.length - uniqueTransactions.length;
  
  return {
    transactions: uniqueTransactions,
    duplicateCount
  };
}

/**
 * 驗證交易記錄
 * @param {Array} transactions - 交易記錄陣列
 * @returns {Object} { valid, errors }
 */
export function validateTransactions(transactions) {
  const errors = [];

  // 按日期排序
  const sortedTxns = [...transactions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // 追蹤每檔股票的持倉
  const holdings = {};

  sortedTxns.forEach((txn, index) => {
    // 驗證必填欄位
    if (!txn.symbol || !txn.type || !txn.date || !txn.quantity || !txn.amount) {
      errors.push({
        index,
        type: 'MISSING_FIELDS',
        message: `第 ${index + 1} 筆交易缺少必填欄位`,
        transaction: txn
      });
      return;
    }

    // 驗證數量和金額
    if (txn.quantity <= 0 || txn.amount <= 0) {
      errors.push({
        index,
        type: 'INVALID_NUMBER',
        message: `第 ${index + 1} 筆交易的數量或金額必須大於 0`,
        transaction: txn
      });
    }

    // 追蹤持倉
    if (txn.type === 'buy') {
      holdings[txn.symbol] = (holdings[txn.symbol] || 0) + txn.quantity;
    } else if (txn.type === 'sell') {
      const currentHolding = holdings[txn.symbol] || 0;
      
      if (txn.quantity > currentHolding + 0.001) { // 允許微小誤差
        errors.push({
          index,
          type: 'INSUFFICIENT_HOLDINGS',
          message: `第 ${index + 1} 筆交易：賣出 ${txn.symbol} ${txn.quantity} 張，但持有僅 ${currentHolding.toFixed(3)} 張`,
          transaction: txn,
          warning: true // 標記為警告而非錯誤
        });
      }
      
      holdings[txn.symbol] = Math.max(0, currentHolding - txn.quantity);
    }
  });

  return {
    valid: errors.filter(e => !e.warning).length === 0,
    errors
  };
}

/**
 * 取得交易摘要統計
 * @param {Array} transactions - 交易記錄陣列
 * @returns {Object} 統計資訊
 */
export function getTransactionSummary(transactions) {
  const buyCount = transactions.filter(t => t.type === 'buy').length;
  const sellCount = transactions.filter(t => t.type === 'sell').length;
  
  const uniqueStocks = new Set(transactions.map(t => t.symbol));
  
  const dateRange = transactions.length > 0 ? {
    start: transactions.reduce((min, t) => 
      t.date < min ? t.date : min, transactions[0].date
    ),
    end: transactions.reduce((max, t) => 
      t.date > max ? t.date : max, transactions[0].date
    )
  } : null;

  const totalInvested = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    total: transactions.length,
    buyCount,
    sellCount,
    uniqueStocks: uniqueStocks.size,
    dateRange,
    totalInvested
  };
}

/**
 * 按日期排序交易記錄
 * @param {Array} transactions - 交易記錄陣列
 * @returns {Array} 排序後的交易記錄
 */
export function sortTransactionsByDate(transactions) {
  return [...transactions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}
