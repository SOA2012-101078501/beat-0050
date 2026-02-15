import { formatCurrency, formatPercentage, formatDate } from '../utils/formatters';

function ResultPage({ result, onBackToHome }) {
  const { performance, summary } = result;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              打敗0050沒？
            </h1>
            <button
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← 重新分析
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Info */}
        {summary.duplicateCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✓ 已成功載入 {summary.total} 筆交易
              {summary.duplicateCount > 0 && ` | ℹ️ 自動去除 ${summary.duplicateCount} 筆重複記錄`}
            </p>
          </div>
        )}

        {/* Performance Card */}
        <div className="card-primary">
          <h2 className="text-2xl font-bold mb-6">您的投資 vs 0050</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <p className="text-white/80 text-sm mb-2">您的報酬率</p>
              <p className="text-4xl font-bold text-number">
                {formatPercentage(performance.user.returnRate, 1)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <p className="text-white/80 text-sm mb-2">0050 報酬率</p>
              <p className="text-4xl font-bold text-number">
                {formatPercentage(performance.etf0050.returnRate, 1)}
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="text-center">
              <p className="text-white/90 text-sm mb-2">差距</p>
              <p className="text-3xl font-bold mb-4 text-number">
                {formatPercentage(performance.comparison.difference, 1)}
              </p>
              <div className="text-xl">
                {performance.comparison.isBetter ? (
                  <>
                    <span className="text-3xl mr-2">🎉</span>
                    <span className="font-semibold">恭喜！您打敗 0050</span>
                    <p className="text-base mt-2 text-white/90">
                      多賺了 {formatPercentage(performance.comparison.difference, 1, false)}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl mr-2">💪</span>
                    <span className="font-semibold">可惜！輸給 0050</span>
                    <p className="text-base mt-2 text-white/90">
                      少賺了 {formatPercentage(Math.abs(performance.comparison.difference), 1, false)}
                    </p>
                    <p className="text-sm mt-1 text-white/80">
                      但被動投資也是好選擇！
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Details */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">您的投資明細</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">總投入成本</span>
                <span className="font-semibold text-number">
                  {formatCurrency(performance.user.totalInvested)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">目前市值</span>
                <span className="font-semibold text-number">
                  {formatCurrency(performance.user.currentValue)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">總損益</span>
                <span className={`font-bold text-number ${
                  performance.user.totalPL > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(performance.user.totalPL, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">總報酬率</span>
                <span className={`font-bold text-number ${
                  performance.user.returnRate > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(performance.user.returnRate)}
                </span>
              </div>
            </div>
          </div>

          {/* 0050 Details */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">如果都買 0050</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">總投入成本</span>
                <span className="font-semibold text-number">
                  {formatCurrency(performance.etf0050.totalInvested)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">目前市值</span>
                <span className="font-semibold text-number">
                  {formatCurrency(performance.etf0050.currentValue)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">總損益</span>
                <span className={`font-bold text-number ${
                  performance.etf0050.totalPL > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(performance.etf0050.totalPL, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">總報酬率</span>
                <span className={`font-bold text-number ${
                  performance.etf0050.returnRate > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(performance.etf0050.returnRate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">交易摘要</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">總交易筆數</p>
              <p className="text-2xl font-bold text-number">{summary.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">交易股票數</p>
              <p className="text-2xl font-bold text-number">{summary.uniqueStocks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">交易期間</p>
              <p className="text-sm font-semibold">
                {summary.dateRange && (
                  <>
                    {formatDate(summary.dateRange.start)}<br />~{' '}
                    {formatDate(summary.dateRange.end)}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBackToHome}
            className="btn-secondary"
          >
            重新分析
          </button>
          <button
            className="btn-primary"
            onClick={() => alert('PDF 下載功能開發中...')}
          >
            下載 PDF 報告
          </button>
        </div>
      </main>
    </div>
  );
}

export default ResultPage;
