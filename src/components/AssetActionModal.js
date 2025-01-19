import React, { useState } from 'react';

const CustomAssetCard = ({ asset, onView, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative group">
      <div 
        className="summary-box p-6 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/30
          transition-all duration-300 hover:bg-slate-800/90 hover:shadow-xl hover:shadow-slate-900/20"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <h3 className="text-xl font-semibold text-white mb-2">{asset.name}</h3>
        <p className="text-white/90 text-lg">
          Total Value: ${parseFloat(asset.totalValue || 0).toFixed(2)}
        </p>
        
        {/* Options Panel */}
        <div 
          className={`absolute right-0 top-0 h-full flex items-center
            transition-all duration-300 ease-out
            ${showOptions 
              ? 'opacity-100 translate-x-full' 
              : 'opacity-0 translate-x-1/2 pointer-events-none'}`}
        >
          <div className="bg-slate-700/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-600/30 ml-4">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onView(asset)}
                className="px-6 py-2.5 text-white bg-blue-500/20 hover:bg-blue-500/30 
                  rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap
                  hover:translate-x-1 hover:shadow-md"
              >
                View Details
              </button>
              <button 
                onClick={() => onDelete(asset)}
                className="px-6 py-2.5 text-white bg-red-500/10 hover:bg-red-500/20 
                  rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap
                  hover:translate-x-1 hover:shadow-md"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAssetCard;