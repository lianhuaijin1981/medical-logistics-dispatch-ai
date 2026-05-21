import React from 'react';
import { cn } from '@med/shared-utils';

export interface DataTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: keyof T;
  loading?: boolean;
  emptyText?: string;
  className?: string;
  onRowClick?: (record: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = '_id' as keyof T,
  loading = false,
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">加载中...</div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  col.className,
                )}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                暂无数据
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={String(record[rowKey] || index)}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(record)}
              >
                {columns.map((col) => {
                  const value = col.dataIndex ? record[col.dataIndex] : undefined;
                  return (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-gray-700', col.className)}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(value, record, index) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
