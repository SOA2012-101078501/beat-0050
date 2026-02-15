# 打敗0050沒？- 股票投資績效分析平台

> 你的選股能力，真的贏過 0050 嗎？

## 📖 專案簡介

「打敗0050沒？」是一個網頁版的股票投資績效分析工具，讓投資人快速了解自己的操作是否優於被動投資 0050 ETF。

### 核心功能

- ✅ 上傳券商對帳單 CSV 檔案
- ✅ 自動解析交易記錄（目前支援國泰證券）
- ✅ 計算與 0050 的績效對比
- ✅ 視覺化圖表呈現
- ✅ 完全隱私保護（資料不上傳伺服器）
- ✅ RWD 響應式設計

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000`

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 📁 專案結構

```
beat-0050/
├── public/
│   └── data/
│       └── stock-name-map.json    # 股票名稱對照表
├── src/
│   ├── components/                 # React 組件
│   │   ├── FileUpload/            # 檔案上傳
│   │   ├── Results/               # 結果展示
│   │   ├── Charts/                # 圖表組件
│   │   └── Common/                # 共用組件
│   ├── services/                   # 業務邏輯
│   │   ├── csvParser.js           # CSV 解析
│   │   ├── stockNameMapper.js     # 股票名稱轉換
│   │   ├── dataValidator.js       # 資料驗證
│   │   ├── performanceEngine.js   # 績效計算（開發中）
│   │   └── etf0050Calculator.js   # 0050 對比計算（開發中）
│   ├── utils/                      # 工具函數
│   │   ├── constants.js           # 常數定義
│   │   ├── formatters.js          # 格式化函數
│   │   └── helpers.js             # 輔助函數
│   ├── pages/                      # 頁面組件
│   │   ├── HomePage.jsx           # 首頁
│   │   └── ResultPage.jsx         # 結果頁
│   ├── styles/                     # 樣式
│   │   └── globals.css            # 全域 CSS
│   ├── App.jsx                     # 主應用組件
│   └── main.jsx                    # 入口檔案
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠 技術棧

- **框架：** React 18
- **建構工具：** Vite
- **樣式：** TailwindCSS
- **圖表：** Recharts
- **CSV 解析：** PapaParse
- **日期處理：** Day.js
- **PDF 生成：** jsPDF + html2canvas

## 📝 開發進度

### ✅ 已完成

- [x] 專案架構建立
- [x] 基本 UI 設計（歐美清爽風格）
- [x] 檔案上傳功能（支援多檔）
- [x] CSV 解析（國泰證券格式）
- [x] 股票名稱轉代碼
- [x] 資料驗證與去重
- [x] 基本結果頁面

### 🚧 開發中

- [ ] 股價 API 整合
- [ ] 績效計算引擎
- [ ] 0050 對比計算邏輯
- [ ] 績效曲線圖表
- [ ] 持股分佈圓餅圖
- [ ] 交易歷史時間軸
- [ ] PDF 報告下載

### 📅 未來規劃

- [ ] 支援更多券商格式
- [ ] 配息收入計算
- [ ] 異常交易標記與說明
- [ ] 進階分析功能（付費版）

## 🎨 設計規範

### 色彩系統

- 主色：`#5BE9B9`（清新綠）
- 次色：`#48D5A5`（深綠）
- 成功：`#5BE9B9`
- 危險：`#FF6B6B`（柔和紅）
- 資訊：`#4A90E2`
- 警告：`#FFA726`

### 字體

- 主要字體：SF Pro Text / Helvetica Neue（iOS 風格）
- 數字字體：SF Mono（等寬字體）

## 📄 授權

MIT License

## 👥 作者

[您的名字]

## 📞 聯絡方式

- Email: your.email@example.com
- GitHub: https://github.com/yourusername/beat-0050

---

**免責聲明：** 本工具僅提供投資績效分析，不構成任何投資建議。過去績效不代表未來表現。
