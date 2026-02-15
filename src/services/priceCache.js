/**
 * 價格快取服務
 * 使用 Session Storage 避免重複 API 呼叫
 */

class PriceCache {
  constructor() {
    this.memoryCache = new Map();
    this.loadFromSession();
  }

  /**
   * 從 Session Storage 載入快取
   */
  loadFromSession() {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        // 只載入股價相關的快取
        if (key && key.startsWith('price_')) {
          const value = sessionStorage.getItem(key);
          if (value) {
            this.memoryCache.set(key, parseFloat(value));
          }
        }
      }
      
      if (this.memoryCache.size > 0) {
        console.log(`已從快取載入 ${this.memoryCache.size} 筆股價資料`);
      }
    } catch (error) {
      console.warn('載入快取失敗:', error);
    }
  }

  /**
   * 取得快取的價格
   * @param {string} symbol - 股票代碼
   * @param {string} date - 日期 (YYYY-MM-DD)
   * @returns {number|null}
   */
  get(symbol, date) {
    const key = `price_${symbol}_${date}`;
    return this.memoryCache.get(key) || null;
  }

  /**
   * 儲存價格到快取
   * @param {string} symbol - 股票代碼
   * @param {string} date - 日期
   * @param {number} price - 價格
   */
  set(symbol, date, price) {
    const key = `price_${symbol}_${date}`;
    
    // 儲存到記憶體
    this.memoryCache.set(key, price);
    
    // 儲存到 Session Storage
    try {
      sessionStorage.setItem(key, price.toString());
    } catch (error) {
      // Session Storage 可能已滿，清除舊資料
      if (error.name === 'QuotaExceededError') {
        console.warn('Session Storage 已滿，清除部分快取');
        this.clearOldCache();
        
        // 再試一次
        try {
          sessionStorage.setItem(key, price.toString());
        } catch (e) {
          console.error('無法儲存快取:', e);
        }
      }
    }
  }

  /**
   * 清除舊的快取（保留最近 100 筆）
   */
  clearOldCache() {
    const keys = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('price_')) {
        keys.push(key);
      }
    }
    
    // 如果超過 100 筆，移除最舊的
    if (keys.length > 100) {
      const toRemove = keys.slice(0, keys.length - 100);
      toRemove.forEach(key => {
        sessionStorage.removeItem(key);
        this.memoryCache.delete(key);
      });
    }
  }

  /**
   * 清除所有快取
   */
  clear() {
    this.memoryCache.clear();
    
    // 清除 Session Storage 中的價格快取
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('price_')) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => sessionStorage.removeItem(key));
    
    console.log('已清除所有價格快取');
  }

  /**
   * 取得快取統計資訊
   * @returns {Object}
   */
  getStats() {
    return {
      count: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }
}

// 建立單例
const priceCache = new PriceCache();

export default priceCache;
