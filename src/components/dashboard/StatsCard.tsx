import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      change: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900',
      change: 'text-green-600'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-900',
      change: 'text-amber-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900',
      change: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      change: 'text-purple-600'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.text} opacity-80`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${colors.text} mt-1`}>
            {typeof value === 'number' && value >= 1000 
              ? value.toLocaleString('es-ES') 
              : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${colors.change}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs mes anterior
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white bg-opacity-50 ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
