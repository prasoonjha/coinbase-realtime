import React from 'react';
import { PriceData } from '../types';

interface StatisticsProps {
  data: PriceData[];
  symbol: string;
}

const Statistics: React.FC<StatisticsProps> = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{symbol} Statistics</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const prices = data.map(d => d.Price);
  const currentPrice = prices[prices.length - 1];
  const high24h = Math.max(...prices);
  const low24h = Math.min(...prices);
  const volume = prices.length;
  
  // Calculate simple moving average (last 10 points)
  const last10 = prices.slice(-10);
  const sma10 = last10.reduce((sum, price) => sum + price, 0) / last10.length;
  
  // Calculate volatility (standard deviation)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance);

  const formatPrice = (price: number) => 
    `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const StatItem = ({ label, value, color = 'text-gray-900' }: { label: string; value: string; color?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{symbol} Statistics</h3>
      <div className="space-y-1">
        <StatItem label="Current Price" value={formatPrice(currentPrice)} color="text-blue-600" />
        <StatItem label="24h High" value={formatPrice(high24h)} color="text-green-600" />
        <StatItem label="24h Low" value={formatPrice(low24h)} color="text-red-600" />
        <StatItem label="SMA (10)" value={formatPrice(sma10)} />
        <StatItem label="Volatility" value={formatPrice(volatility)} />
        <StatItem label="Data Points" value={volume.toString()} />
      </div>
    </div>
  );
};

export default Statistics;
