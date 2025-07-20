import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { ChartDataPoint } from '../types';

interface PriceChartProps {
  data: ChartDataPoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const formatPrice = (value: number) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const btcData = payload.find((p: any) => p.dataKey === 'BTC-USD');
      const ethData = payload.find((p: any) => p.dataKey === 'ETH-USD');
      
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-95">
          <p className="text-sm text-gray-600 mb-2 font-medium">{`Time: ${label}`}</p>
          {btcData && (
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#f7931a' }}></div>
              <span className="text-sm font-semibold text-gray-800">
                Bitcoin: {formatPrice(btcData.value)}
              </span>
            </div>
          )}
          {ethData && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#627eea' }}></div>
              <span className="text-sm font-semibold text-gray-800">
                Ethereum: {formatPrice(ethData.value)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    if (!payload) return null;
    
    // Only show dots for the last few points to create a "trailing" effect
    const isRecent = data.length > 0 && data.indexOf(payload) >= data.length - 3;
    
    if (!isRecent) return null;
    
    const color = dataKey === 'BTC-USD' ? '#f7931a' : '#627eea';
    const isLast = data.indexOf(payload) === data.length - 1;
    
    return (
      <g>
        {isLast && (
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={color}
            className="animate-pulse"
            opacity={0.3}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isLast ? 4 : 2}
          fill={color}
          stroke="white"
          strokeWidth={isLast ? 2 : 1}
          className={isLast ? "animate-pulse" : ""}
        />
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-30"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Real-time Price Movement</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">BTC-USD</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">ETH-USD</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f7931a" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f7931a" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="ethGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#627eea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#627eea" stopOpacity={0.1}/>
              </linearGradient>
              
              {/* Glow effect filters */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e0e7ff" 
              opacity={0.5}
            />
            
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const index = data.findIndex(d => d.time === value);
                return index % 10 === 0 ? value : '';
              }}
            />
            
            <YAxis 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* BTC Line with glow effect */}
            <Line
              type="monotone"
              dataKey="BTC-USD"
              stroke="url(#btcGradient)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ 
                r: 6, 
                fill: '#f7931a',
                stroke: '#fff',
                strokeWidth: 2,
                filter: "url(#glow)"
              }}
              name="Bitcoin (BTC-USD)"
              connectNulls={false}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            
            {/* ETH Line with glow effect */}
            <Line
              type="monotone"
              dataKey="ETH-USD"
              stroke="url(#ethGradient)"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ 
                r: 6, 
                fill: '#627eea',
                stroke: '#fff',
                strokeWidth: 2,
                filter: "url(#glow)"
              }}
              name="Ethereum (ETH-USD)"
              connectNulls={false}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-gray-700">LIVE</span>
      </div>
    </div>
  );
};

export default PriceChart;
