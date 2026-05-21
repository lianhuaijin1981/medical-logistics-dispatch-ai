import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';
import vehicleService from '../../services/vehicleService';
import warehouseService from '../../services/warehouseService';
import type { DashboardStats } from '../../services/dashboardService';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@med/ui-components';
import dayjs from 'dayjs';

const ANALYTICS: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getDashboardStats,
    refetchInterval: 60000,
  });

  const { data: vehicleData } = useQuery({
    queryKey: ['vehicles', 'list'],
    queryFn: () => vehicleService.getList({ pageSize: 100 }),
  });

  const { data: warehouseData } = useQuery({
    queryKey: ['warehouses', 'list'],
    queryFn: () => warehouseService.getList({ pageSize: 100 }),
  });

  // ---- Mock 7-day trend data ----
  const trendData = useMemo(() => {
    const days = 7;
    const dates: string[] = [];
    const counts: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day');
      dates.push(d.format('MM-DD'));
      counts.push(Math.floor(Math.random() * 50) + 10);
    }
    return { dates, counts };
  }, []);

  const pieOption: EChartsOption = {
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0 },
    series: stats
      ? [
          {
            type: 'pie' as const,
            radius: ['40%', '70%'],
            data: [
              { value: stats.orders.pending, name: '待处理', itemStyle: { color: '#f59e0b' } },
              { value: stats.orders.processing, name: '处理中', itemStyle: { color: '#3b82f6' } },
              { value: stats.orders.delivered, name: '已送达', itemStyle: { color: '#22c55e' } },
              { value: stats.orders.cancelled, name: '已取消', itemStyle: { color: '#ef4444' } },
            ].filter((d) => d.value > 0),
          },
        ]
      : [],
  };

  const lineOption: EChartsOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['订单量'] },
    xAxis: { type: 'category' as const, data: trendData.dates },
    yAxis: { type: 'value' as const, name: '订单数' },
    series: [{ type: 'line', data: trendData.counts, smooth: true, itemStyle: { color: '#3b82f6' } }],
  };

  const barOption: EChartsOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: warehouseData?.items?.map((w: { name: string }) => w.name) || [],
    },
    yAxis: { type: 'value' as const, name: '利用率(%)' },
    series: [
      {
        type: 'bar' as const,
        data: warehouseData?.items?.map(() => Math.floor(Math.random() * 100)) || [],
        itemStyle: { color: '#3b82f6' },
      },
    ],
  };

  const doughnutOption: EChartsOption = {
    tooltip: { trigger: 'item' as const },
    legend: { bottom: 0 },
    series: vehicleData
      ? [
          {
            type: 'pie' as const,
            radius: ['40%', '70%'],
            data: (() => {
              const counts: Record<string, number> = {};
              vehicleData.items?.forEach((v: { type: string }) => {
                const label =
                  v.type === 'truck_small' ? '小型车' :
                  v.type === 'truck_medium' ? '中型车' :
                  v.type === 'truck_large' ? '大型车' :
                  v.type === 'refrigerated' ? '冷藏车' : '其他';
                counts[label] = (counts[label] || 0) + 1;
              });
              return Object.entries(counts).map(([name, value]) => ({ name, value }));
            })(),
          },
        ]
      : [],
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">数据分析</h1>
        <p className="text-gray-500 text-sm">运营数据可视化</p>
      </div>

      {isLoading && !stats && <Loading text="加载分析数据..." />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '订单总量', value: stats?.orders.total ?? '—', unit: '单' },
          { label: '准时率', value: '94.2', unit: '%' },
          { label: '库存周转率', value: '6.8', unit: '次/年' },
          { label: '车辆使用率', value: '72.5', unit: '%' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className="text-2xl font-bold text-gray-900">
              {c.value}<span className="text-sm text-gray-400 ml-1">{c.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Line + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">订单趋势</h3>
          <ReactECharts option={lineOption} style={{ height: 280 }} notMerge />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">订单状态分布</h3>
          <ReactECharts option={pieOption} style={{ height: 280 }} notMerge />
        </div>
      </div>

      {/* Row 2: Bar + Doughnut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">仓库利用率</h3>
          <ReactECharts option={barOption} style={{ height: 280 }} notMerge />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">车辆类型分布</h3>
          <ReactECharts option={doughnutOption} style={{ height: 280 }} notMerge />
        </div>
      </div>

      {/* Row 3: Compliance trend (mock) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">温控合规率趋势</h3>
        <ReactECharts
          option={{
            tooltip: { trigger: 'axis' as const },
            xAxis: { type: 'category' as const, data: trendData.dates },
            yAxis: { type: 'value' as const, name: '合规率(%)', min: 80, max: 100 },
            series: [
              {
                type: 'line' as const,
                data: trendData.dates.map(() => 92 + Math.random() * 8),
                smooth: true,
                areaStyle: { color: 'rgba(34,197,94,0.15)' },
                itemStyle: { color: '#22c55e' },
              },
            ],
          }}
          style={{ height: 280 }}
          notMerge
        />
      </div>
    </div>
  );
};

export default ANALYTICS;
