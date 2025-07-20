import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from '../types';

interface PriceChartProps {
  data: ChartDataPoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {`${entry.dataKey}: ${formatPrice(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Price Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => {
              // Show only every 10th label to avoid crowding
              const index = data.findIndex(d => d.time === value);
              return index % 10 === 0 ? value : '';
            }}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="BTC-USD"
            stroke="#f7931a"
            strokeWidth={2}
            dot={false}
            name="Bitcoin (BTC-USD)"
          />
          <Line
            type="monotone"
            dataKey="ETH-USD"
            stroke="#627eea"
            strokeWidth={2}
            dot={false}
            name="Ethereum (ETH-USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
