import React, { useState, useEffect } from 'react';

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
  const [previousPrice, setPreviousPrice] = useState(price);
  const [priceAnimation, setPriceAnimation] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (price !== previousPrice && previousPrice !== 0) {
      const isIncreasing = price > previousPrice;
      setPriceAnimation(isIncreasing ? 'price-up' : 'price-down');
      setIsFlashing(true);
      
      // Reset animation after duration
      const timer = setTimeout(() => {
        setPriceAnimation('');
        setIsFlashing(false);
      }, 1000);
      
      setPreviousPrice(price);
      return () => clearTimeout(timer);
    } else if (previousPrice === 0) {
      setPreviousPrice(price);
    }
  }, [price, previousPrice]);

  const isPositive = change !== undefined && change >= 0;
  const changeColor = change === undefined ? 'text-gray-500' : 
                     isPositive ? 'text-green-500' : 'text-red-500';
  
  const priceChangeColor = priceAnimation === 'price-up' ? 'text-green-600' : 
                          priceAnimation === 'price-down' ? 'text-red-600' : 'text-gray-900';

  const cardBgColor = isFlashing ? 
    (priceAnimation === 'price-up' ? 'bg-green-50' : 'bg-red-50') : 'bg-white';

  return (
    <div className={`${cardBgColor} rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-1000 relative overflow-hidden`}>
      {/* Animated background pulse */}
      {isFlashing && (
        <div className={`absolute inset-0 ${priceAnimation === 'price-up' ? 'bg-green-400' : 'bg-red-400'} opacity-10 animate-pulse`}></div>
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Symbol with icon */}
            <div className="flex items-center mb-2">
              <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white text-sm font-bold
                ${symbol === 'BTC-USD' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}>
                {symbol === 'BTC-USD' ? '₿' : 'Ξ'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{symbol}</h3>
                <p className="text-xs text-gray-500">
                  {symbol === 'BTC-USD' ? 'Bitcoin' : 'Ethereum'}
                </p>
              </div>
            </div>
            
            {/* Price with animation */}
            <p className={`text-3xl font-bold transition-all duration-300 ${priceChangeColor}`}>
              ${price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              {priceAnimation && (
                <span className={`ml-2 text-lg ${priceAnimation === 'price-up' ? 'text-green-500' : 'text-red-500'}`}>
                  {priceAnimation === 'price-up' ? '↗' : '↘'}
                </span>
              )}
            </p>
          </div>
          
          {/* Change indicators */}
          {change !== undefined && (
            <div className={`text-right ${changeColor}`}>
              <div className="flex items-center justify-end mb-1">
                <span className={`text-sm mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '▲' : '▼'}
                </span>
                <p className="text-sm font-medium">
                  {isPositive ? '+' : ''}${Math.abs(change).toFixed(2)}
                </p>
              </div>
              {changePercent !== undefined && (
                <p className="text-sm">
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Live status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 animate-pulse
              ${isPositive ? 'bg-green-500' : change !== undefined ? 'bg-red-500' : 'bg-blue-500'}`}>
            </div>
            <span className="text-sm text-gray-500 font-medium">Live</span>
          </div>
          
          {/* Price movement indicator */}
          <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 rounded-full transition-all duration-300 ${
                  priceAnimation === 'price-up' 
                    ? 'bg-green-400 animate-bounce' 
                    : priceAnimation === 'price-down'
                    ? 'bg-red-400 animate-bounce'
                    : 'bg-gray-300'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Subtle border animation for price changes */}
      {isFlashing && (
        <div className={`absolute inset-0 rounded-lg border-2 ${
          priceAnimation === 'price-up' ? 'border-green-400' : 'border-red-400'
        } animate-pulse`}></div>
      )}
    </div>
  );
};

export default PriceDisplay;
