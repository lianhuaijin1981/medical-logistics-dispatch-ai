import React from 'react';
import { cn } from '@med/shared-utils';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  dispatched: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  exception: 'bg-red-100 text-red-800',
  idle: 'bg-gray-100 text-gray-600',
  available: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  in_progress: '进行中',
  dispatched: '已派车',
  in_transit: '运输中',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
  exception: '异常',
  idle: '空闲',
  available: '可用',
  assigned: '已分配',
  picking: '拣货中',
  picked: '已拣货',
  loading: '装车中',
  departed: '已出发',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600';
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
};
