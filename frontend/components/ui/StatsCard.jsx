import React from 'react';
import { LucideIcon } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconBgColor,
  iconColor 
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold mb-2">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {changeType === 'positive' ? '+' : ''}{change}
              </span>
              <span className="text-slate-500 text-sm">from last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;