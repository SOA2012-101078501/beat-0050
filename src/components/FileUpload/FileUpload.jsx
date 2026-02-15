import { useState, useRef } from 'react';
import { parseMultipleCSVFiles } from '../../services/csvParser';
import { removeDuplicates, validateTransactions, getTransactionSummary } from '../../services/dataValidator';

function FileUpload({ onAnalysisComplete }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const csvFiles = Array.from(selectedFiles).filter(file => 
      file.name.endsWith('.csv') || file.type === 'text/csv'
    );

    if (csvFiles.length === 0) {
      setError('請選擇 CSV 格式的檔案');
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...csvFiles]);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('請先上傳檔案');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. 解析 CSV 檔案
      console.log('開始解析 CSV...', files);
      const { transactions, errors } = await parseMultipleCSVFiles(files);
      
      // Debug: 顯示解析結果
      console.log('解析結果 - 交易數:', transactions.length);
      console.log('解析結果 - 前3筆:', transactions.slice(0, 3));
      console.log('解析錯誤:', errors);

      if (errors.length > 0) {
        console.warn('解析警告:', errors);
      }

      if (transactions.length === 0) {
        setError('未偵測到有效的交易記錄');
        setIsProcessing(false);
        return;
      }

      // 2. 去重
      const { transactions: uniqueTxns, duplicateCount } = removeDuplicates(transactions);
      console.log(`總共 ${transactions.length} 筆，去重後 ${uniqueTxns.length} 筆`);

      // 3. 驗證
      const { valid, errors: validationErrors } = validateTransactions(uniqueTxns);
      
      // 只顯示嚴重錯誤，警告忽略
      const severeErrors = validationErrors.filter(e => !e.warning);
      if (severeErrors.length > 0) {
        console.error('驗證錯誤:', severeErrors);
        setError(`發現 ${severeErrors.length} 個錯誤，請檢查檔案格式`);
        setIsProcessing(false);
        return;
      }

      // 4. 取得摘要
      const summary = getTransactionSummary(uniqueTxns);

      // 5. 計算績效
      console.log('開始計算績效...');

      // 動態載入計算模組
      const { calculateUserPerformance } = await import('../../services/performanceEngine.js');
      const { calculate0050Performance } = await import('../../services/etf0050Calculator.js');

      // 計算用戶績效
      const userPerformance = await calculateUserPerformance(uniqueTxns);

      // 計算 0050 對比績效
      const etf0050Performance = await calculate0050Performance(uniqueTxns);

      // 計算比較結果
      const difference = userPerformance.returnRate - etf0050Performance.returnRate;
      const isBetter = difference > 0;

      const result = {
        transactions: uniqueTxns,
        summary: {
          ...summary,
          duplicateCount,
          parseErrors: errors.length,
          validationWarnings: validationErrors.filter(e => e.warning).length
        },
        performance: {
          user: userPerformance,
          etf0050: etf0050Performance,
          comparison: {
            difference: difference,
            isBetter: isBetter
          }
        }
      };

      console.log('績效計算完成:', result);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('分析失敗:', error);
      setError(error.message || '分析失敗，請檢查檔案格式');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-card-lg p-12 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-102' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-6xl">📊</div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              拖曳或點擊上傳
            </p>
            <p className="text-sm text-gray-600">
              支援國泰證券 CSV 格式<br />
              可同時上傳多個檔案
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              已選擇 {files.length} 個檔案
            </h3>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              清除全部
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors ml-4"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Analyze Button */}
      {files.length > 0 && (
        <button
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              分析中...
            </span>
          ) : (
            '開始分析'
          )}
        </button>
      )}
    </div>
  );
}

export default FileUpload;
