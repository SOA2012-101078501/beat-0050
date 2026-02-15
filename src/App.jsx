import { useState, useEffect } from 'react';
import './styles/globals.css';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import { loadStockNameMap } from './services/stockNameMapper';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'result'
  const [analysisResult, setAnalysisResult] = useState(null);

  // 載入股票名稱對照表
  useEffect(() => {
    const init = async () => {
      try {
        await loadStockNameMap();
        console.log('股票名稱對照表載入完成');
      } catch (error) {
        console.error('載入失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentPage('result');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setAnalysisResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && (
        <HomePage onAnalysisComplete={handleAnalysisComplete} />
      )}
      
      {currentPage === 'result' && analysisResult && (
        <ResultPage 
          result={analysisResult} 
          onBackToHome={handleBackToHome} 
        />
      )}
    </div>
  );
}

export default App;
