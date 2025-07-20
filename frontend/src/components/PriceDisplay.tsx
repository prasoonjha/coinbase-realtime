import React from 'react';

interface PriceDisplayProps {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  symbol, 
  price, 
  change, 
  changePercent 
}) => {
  const isPositive = change && change >= 0;
  const changeColor = change === undefined ? 'text-gray-500' : 
                     isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{symbol}</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
        {change !== undefined && (
          <div className={`text-right ${changeColor}`}>
            <p className="text-sm font-medium">
              {isPositive ? '+' : ''}${change.toFixed(2)}
            </p>
            {changePercent !== undefined && (
              <p className="text-sm">
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
        <span className="text-sm text-gray-500">Live</span>
      </div>
    </div>
  );
};

export default PriceDisplay;
