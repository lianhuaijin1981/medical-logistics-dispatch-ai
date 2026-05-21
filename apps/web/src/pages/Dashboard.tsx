import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import { StatCard } from '@med/ui-components';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';
import { formatNumber, formatCurrency } from '@med/shared-utils';

const statusLabel: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消',
};

const statusColor: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  shipped: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
};

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // 30秒自动刷新
  });

  if (isLoading) return <Loading text="加载运营数据..." size="lg" />;
  if (error) return <div className="p-6 text-red-600">数据加载失败，请刷新重试</div>;
  if (!data) return <div className="p-6 text-gray-500">暂无数据</div>;

  const { orders, inventory, vehicles, drivers, alerts, recentOrders } = data;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">运营大盘</h1>
        <p className="text-gray-500 text-sm">实时数据 · 每30秒自动刷新</p>
      </div>

      {/* 订单统计 */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">订单概况</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="订单总量" value={formatNumber(orders.total)} icon="📦" />
          <StatCard title="今日新增" value={formatNumber(orders.todayCount)} icon="📈" trend={{ direction: 'up', value: '12%' }} />
          <StatCard title="待处理" value={formatNumber(orders.pending)} icon="⏳" />
          <StatCard title="处理中" value={formatNumber(orders.processing)} icon="🔄" />
          <StatCard title="已发货" value={formatNumber(orders.shipped)} icon="🚚" />
          <StatCard title="已送达" value={formatNumber(orders.delivered)} icon="✅" />
        </div>
      </section>

      {/* 库存 + 车辆 + 司机概览 */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">资源概况</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="库存总量" value={formatNumber(inventory.totalItems)} icon="📦" />
          <StatCard title="低库存预警" value={formatNumber(inventory.lowStock)} icon="⚠️" />
          <StatCard title="即将过期" value={formatNumber(inventory.expiringItems)} icon="⏰" />
          <StatCard title="可用车辆" value={formatNumber(vehicles.available)} icon="🚛" />
          <StatCard title="在岗司机" value={formatNumber(drivers.available)} icon="👤" />
        </div>
      </section>

      {/* 告警统计 */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">告警中心</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="告警总数" value={formatNumber(alerts.total)} icon="🔔" />
          <StatCard title="严重告警" value={formatNumber(alerts.critical)} icon="🔴" />
          <StatCard title="警告" value={formatNumber(alerts.warning)} icon="🟡" />
          <StatCard title="提示" value={formatNumber(alerts.info)} icon="🔵" />
          <StatCard title="未处理" value={formatNumber(alerts.unresolved)} icon="🚨" />
        </div>
      </section>

      {/* 订单状态分布 */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">订单状态分布</h3>
          <div className="space-y-3">
            {Object.entries(statusLabel).map(([key, label]) => {
              const count = orders[key as keyof typeof orders] as number;
              const pct = orders.total > 0 ? Math.round((count / orders.total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusColor[key])}>
                    {label}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 车辆状态 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">车辆状态</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '可用', value: vehicles.available, color: 'bg-green-500' },
              { label: '配送中', value: vehicles.onTrip, color: 'bg-blue-500' },
              { label: '维修中', value: vehicles.maintenance, color: 'bg-yellow-500' },
              { label: '离线', value: vehicles.offline, color: 'bg-gray-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-lg font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最近订单 */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">最近订单</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {recentOrders && recentOrders.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">订单号</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-right font-medium">金额</th>
                  <th className="px-4 py-3 text-left font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusColor[order.status] || 'text-gray-600 bg-gray-100')}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">¥{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-400">暂无订单数据</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
