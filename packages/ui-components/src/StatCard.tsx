import React from 'react';
import { cn } from '@med/shared-utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down'; value: string };
  icon?: React.ReactNode;
  className?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon,
  className,
  color = 'blue',
}) => {
  const colors = colorMap[color];

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <span className={cn('p-2 rounded-lg', colors.bg, colors.text)}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={cn(
              'text-xs font-medium',
              trend.direction === 'up' ? 'text-red-500' : 'text-green-500',
            )}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-gray-400">较上期</span>
        </div>
      )}
    </div>
  );
};
