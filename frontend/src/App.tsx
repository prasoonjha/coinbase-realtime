import React, { useState, useEffect } from 'react';
import PriceDisplay from './components/PriceDisplay';
import PriceChart from './components/PriceChart';
import Statistics from './components/Statistics';
import { api } from './services/api';
import { CoinbaseData, ChartDataPoint, PriceData } from './types';

function App() {
  const [data, setData] = useState<CoinbaseData>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const newData = await api.getPriceData();
      setData(newData);
      setError(null);
      
      // Transform data for chart
      const transformedData = transformDataForChart(newData);
      setChartData(transformedData);
      
      if (loading) setLoading(false);
    } catch (err) {
      setError('Failed to fetch data. Make sure the Go server is running on localhost:8080');
      console.error('Fetch error:', err);
    }
  };

  const transformDataForChart = (coinbaseData: CoinbaseData): ChartDataPoint[] => {
    const btcData = coinbaseData['BTC-USD'] || [];
    const ethData = coinbaseData['ETH-USD'] || [];
    
    // Create a combined timeline
    const maxLength = Math.max(btcData.length, ethData.length);
    const chartPoints: ChartDataPoint[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      const btcPoint = btcData[i];
      const ethPoint = ethData[i];
      
      if (btcPoint || ethPoint) {
        const timestamp = btcPoint ? new Date(btcPoint.Timestamp).getTime() : new Date(ethPoint.Timestamp).getTime();
        const timeString = new Date(timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        chartPoints.push({
          time: timeString,
          'BTC-USD': btcPoint ? btcPoint.Price : 0,
          'ETH-USD': ethPoint ? ethPoint.Price : 0,
          timestamp
        });
      }
    }
    
    return chartPoints.sort((a, b) => a.timestamp - b.timestamp);
  };

  const getPriceChange = (symbol: string, currentData: PriceData[]): { change: number; changePercent: number } | null => {
    if (!currentData || currentData.length < 2) return null;
    
    const current = currentData[currentData.length - 1].Price;
    const previous = currentData[currentData.length - 2].Price;
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    
    return { change, changePercent };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startFetching = async () => {
      await fetchData(); // Initial fetch
      interval = setInterval(fetchData, 1000); // Fetch every second
    };
    
    startFetching();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []); // fetchData is stable and doesn't need to be in dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const btcData = data['BTC-USD'] || [];
  const ethData = data['ETH-USD'] || [];
  const btcChange = getPriceChange('BTC-USD', btcData);
  const ethChange = getPriceChange('ETH-USD', ethData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Coinbase Real-time Tracker
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PriceDisplay
            symbol="BTC-USD"
            price={btcData.length > 0 ? btcData[btcData.length - 1].Price : 0}
            change={btcChange?.change}
            changePercent={btcChange?.changePercent}
          />
          <PriceDisplay
            symbol="ETH-USD"
            price={ethData.length > 0 ? ethData[ethData.length - 1].Price : 0}
            change={ethChange?.change}
            changePercent={ethChange?.changePercent}
          />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <PriceChart data={chartData} />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Statistics data={btcData} symbol="BTC-USD" />
          <Statistics data={ethData} symbol="ETH-USD" />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Real-time cryptocurrency data from Coinbase WebSocket API</p>
            <p className="mt-1">Updates every second • Data points limited to last 100 entries</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
