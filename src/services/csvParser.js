/**
 * CSV 解析服務 - 國泰證券格式
 */

import Papa from 'papaparse';
import { CATHAY_CSV_COLUMNS, TRANSACTION_TYPE } from '../utils/constants.js';
import { stockNameToCode } from './stockNameMapper.js';
import { convertDateFormat, sharesToLots } from '../utils/formatters.js';

/**
 * 解析國泰證券 CSV 檔案
 * @param {File} file - CSV 檔案
 * @returns {Promise<Object>} { transactions, errors }
 */
export async function parseCathayCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const { transactions, errors } = processKathayData(results.data);
          resolve({ transactions, errors });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV 解析失敗: ${error.message}`));
      }
    });
  });
}

/**
 * 處理國泰證券資料
 * @param {Array} data - 解析後的 CSV 資料
 * @returns {Object} { transactions, errors }
 */
function processKathayData(data) {
  const transactions = [];
  const errors = [];

  data.forEach((row, index) => {
    try {
      const transaction = parseKathayRow(row, index + 1);
      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      errors.push({
        row: index + 1,
        message: error.message,
        data: row
      });
    }
  });

  return { transactions, errors };
}

/**
 * 解析單行國泰證券資料
 * @param {Object} row - CSV 行資料
 * @param {number} rowNumber - 行號
 * @returns {Object|null} 交易記錄
 */
function parseKathayRow(row, rowNumber) {
  // 取得欄位值
  const stockName = row[CATHAY_CSV_COLUMNS.STOCK_NAME]?.trim();
  const date = row[CATHAY_CSV_COLUMNS.DATE]?.trim();
  const shares = row[CATHAY_CSV_COLUMNS.SHARES];
  const transactionType = row[CATHAY_CSV_COLUMNS.TRANSACTION_TYPE]?.trim();
  const buyAmount = row[CATHAY_CSV_COLUMNS.BUY_AMOUNT];
  const sellAmount = row[CATHAY_CSV_COLUMNS.SELL_AMOUNT];
  const fee = row[CATHAY_CSV_COLUMNS.FEE];
  const tax = row[CATHAY_CSV_COLUMNS.TAX];

  // 驗證必填欄位
  if (!stockName || !date || !shares || !transactionType) {
    throw new Error(`第 ${rowNumber} 行：缺少必填欄位`);
  }

  // 轉換股票名稱為代碼
  const symbol = stockNameToCode(stockName);
  if (!symbol) {
    throw new Error(`第 ${rowNumber} 行：找不到股票「${stockName}」的代碼`);
  }

  // 判斷買賣類型
  const isBuy = transactionType.includes('買');
  const type = isBuy ? TRANSACTION_TYPE.BUY : TRANSACTION_TYPE.SELL;

  // 取得交易金額
  const amount = isBuy 
    ? parseFloat(buyAmount) 
    : parseFloat(sellAmount);

  if (isNaN(amount) || amount <= 0) {
    throw new Error(`第 ${rowNumber} 行：交易金額格式錯誤`);
  }

  // 轉換股數為張數
  const sharesNumber = parseFloat(shares);
  if (isNaN(sharesNumber) || sharesNumber <= 0) {
    throw new Error(`第 ${rowNumber} 行：股數格式錯誤`);
  }
  const quantity = sharesToLots(sharesNumber);

  // 轉換日期格式
  const formattedDate = convertDateFormat(date);

  // 驗證日期
  const dateObj = new Date(formattedDate);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`第 ${rowNumber} 行：日期格式錯誤「${date}」`);
  }

  // 檢查日期不能晚於今天
  if (dateObj > new Date()) {
    throw new Error(`第 ${rowNumber} 行：日期不能晚於今天`);
  }

  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol,
    name: stockName,
    type,
    date: formattedDate,
    quantity,
    amount,
    fee: parseFloat(fee) || 0,
    tax: parseFloat(tax) || 0,
    originalRow: rowNumber
  };
}

/**
 * 解析多個 CSV 檔案
 * @param {File[]} files - CSV 檔案陣列
 * @returns {Promise<Object>} { transactions, errors }
 */
export async function parseMultipleCSVFiles(files) {
  const allTransactions = [];
  const allErrors = [];

  for (const file of files) {
    try {
      const { transactions, errors } = await parseCathayCSV(file);
      allTransactions.push(...transactions);
      allErrors.push(...errors.map(e => ({ ...e, file: file.name })));
    } catch (error) {
      allErrors.push({
        file: file.name,
        message: error.message
      });
    }
  }

  return {
    transactions: allTransactions,
    errors: allErrors
  };
}
