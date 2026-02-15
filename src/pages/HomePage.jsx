import { useState } from 'react';
import FileUpload from '../components/FileUpload/FileUpload';

function HomePage({ onAnalysisComplete }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              打敗0050沒？
            </h1>
            <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              關於
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            你的選股能力，<br />
            真的贏過 0050 嗎？
          </h2>
          <p className="text-xl text-gray-600">
            📈 上傳對帳單，立即比較績效
          </p>
        </div>

        {/* File Upload Component */}
        <div className="max-w-2xl mx-auto">
          <FileUpload onAnalysisComplete={onAnalysisComplete} />
        </div>

        {/* Features */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>完全免費</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>隱私保護</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>即時分析</span>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            為什麼要與 0050 比較？
          </h3>
          <p className="text-gray-600 text-center leading-relaxed">
            0050 是台灣最具代表性的被動投資 ETF，追蹤台灣市值前 50 大企業。<br />
            研究顯示，長期而言，多數主動選股難以持續打敗大盤。<br />
            用這個工具，誠實面對你的投資績效！
          </p>
        </div>
      </section>

      {/* How to Use */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          如何使用？
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              1️⃣
            </div>
            <h4 className="font-semibold mb-2">下載對帳單</h4>
            <p className="text-sm text-gray-600">
              從券商下載交易對帳單<br />
              （CSV 格式）<br />
              目前支援：國泰證券
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              2️⃣
            </div>
            <h4 className="font-semibold mb-2">上傳檔案</h4>
            <p className="text-sm text-gray-600">
              上傳到本網站<br />
              可多個檔案一起上傳<br />
              資料不會儲存到伺服器
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              3️⃣
            </div>
            <h4 className="font-semibold mb-2">獲得分析</h4>
            <p className="text-sm text-gray-600">
              立即獲得與 0050 的<br />
              績效對比結果<br />
              含詳細圖表與數據
            </p>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-card p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔒</span>
              您的資料安全
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>所有計算在您的瀏覽器本地進行</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>資料不會上傳到任何伺服器</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>關閉網頁即清空所有資料</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>無需註冊登入</span>
              </li>
            </ul>
          </div>

          {/* 資料範圍說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-card p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>📅</span>
              資料範圍說明
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-1">股價資料來源：</p>
                <p>Yahoo Finance（真實股價，每日更新）</p>
              </div>
              <div>
                <p className="font-semibold mb-1">0050 資料範圍：</p>
                <p>2003 年 6 月 30 日（上市日）至今</p>
              </div>
              <div>
                <p className="font-semibold mb-1">建議使用：</p>
                <p>請上傳 <strong>2003/06/30 之後</strong>的交易記錄</p>
                <p className="text-xs mt-1 text-blue-600">
                  ⚠️ 更早的日期可能無法取得 0050 股價資料
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">更新頻率：</p>
                <p>每個交易日收盤後自動更新（約 14:30 之後）</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            © 2026 打敗0050沒？ | 隱私政策 | 聯絡我們
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
