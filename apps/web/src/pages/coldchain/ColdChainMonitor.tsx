import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import coldChainService from '../../services/coldChainService';
import vehicleService from '../../services/vehicleService';
import type { ColdChainRecord, TemperatureZone } from '@med/shared-types';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@med/ui-components';
import cn from 'clsx';
import dayjs from 'dayjs';

const ZONE_LABELS: Record<TemperatureZone, string> = {
  ambient: '常温', cool: '阴凉', cold: '冷藏', frozen: '冷冻',
};
const ZONE_COLORS: Record<TemperatureZone, string> = {
  ambient: '#6b7280', cool: '#3b82f6', cold: '#4f46e5', frozen: '#0891b2',
};

const timeRangeOptions = [
  { value: 1, label: '最近1小时' },
  { value: 6, label: '最近6小时' },
  { value: 24, label: '最近24小时' },
  { value: 0, label: '全部' },
];

const ColdChainMonitor: React.FC = () => {
  const [hours, setHours] = useState<number>(1);
  const [selectedDispatch, setSelectedDispatch] = useState<string>('');
  const [realtime, setRealtime] = useState(true);

  const params: Record<string, string> = {};
  if (hours > 0) {
    params.startTime = dayjs().subtract(hours, 'hour').toISOString();
    params.endTime = dayjs().toISOString();
  }
  if (selectedDispatch) params.dispatchId = selectedDispatch;

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['cold-chain', 'list', params],
    queryFn: () => coldChainService.getList(params),
    refetchInterval: realtime ? 10000 : undefined,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['cold-chain', 'stats', selectedDispatch],
    queryFn: () => coldChainService.getStats(
      selectedDispatch ? { dispatchId: selectedDispatch } : {},
    ),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', 'list'],
    queryFn: () => vehicleService.getList({ pageSize: 100 }),
    select: (d) => d.items || [],
  });

  // ---- ECharts option ----
  const getChartOption = (): EChartsOption => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const timeAxis = sorted.map((r) => r.timestamp);

    const makeSeries = (zone: TemperatureZone) => {
      const zoneData = sorted.filter((r) => r.zone === zone);
      return {
        name: ZONE_LABELS[zone],
        type: 'line' as const,
        symbol: 'circle',
        symbolSize: 4,
        data: zoneData.map((r) => [r.timestamp, r.temperature]),
        lineStyle: { color: ZONE_COLORS[zone], width: 2 },
        itemStyle: { color: ZONE_COLORS[zone] },
        markArea: zoneData.length > 0 && zoneData[0].rangeLimit
          ? {
              silent: true,
              itemStyle: { color: ZONE_COLORS[zone], opacity: 0.08 },
              data: zoneData[0].rangeLimit
                ? [[
                    { yAxis: zoneData[0].rangeLimit.min },
                    { yAxis: zoneData[0].rangeLimit.max },
                  ]]
                : [],
            }
          : undefined,
        markPoint: zoneData.some((r) => !r.withinRange)
          ? {
              data: zoneData
                .filter((r) => !r.withinRange)
                .map((r) => ({
                  name: '超温',
                  coord: [r.timestamp, r.temperature] as [string, number],
                  value: '超温',
                  itemStyle: { color: '#ef4444' },
                })),
              symbol: 'pin',
              symbolSize: 32,
            }
          : undefined,
      };
    };

    return {
      tooltip: { trigger: 'axis' as const },
      legend: { data: Object.values(ZONE_LABELS), bottom: 0 },
      grid: { left: 50, right: 20, top: 30, bottom: 40 },
      xAxis: { type: 'time' as const, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value' as const, name: '温度 (°C)' },
      series: (Object.keys(ZONE_LABELS) as TemperatureZone[])
        .filter((z) => sorted.some((r) => r.zone === z))
        .map(makeSeries) as EChartsOption['series'],
    };
  };

  const totalCount = records.length;
  const withinCount = records.filter((r) => r.withinRange).length;
  const breachCount = totalCount - withinCount;
  const activeVehicles = new Set(records.map((r) => r.vehicleId)).size;

  return (
    <div className="page-container">
      <div className="page-header flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">冷链监控</h1>
          <p className="text-gray-500 text-sm">温湿度实时监控与报警</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={realtime}
              onChange={(e) => setRealtime(e.target.checked)}
            />
            实时监控
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            {timeRangeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '总运输任务', value: (stats as any)?.totalTasks ?? '—', color: 'blue' },
          { label: '温控合格率', value: totalCount > 0 ? `${Math.round((withinCount / totalCount) * 100)}%` : '—', color: 'green' },
          { label: '超温报警', value: breachCount, color: 'red' },
          { label: '传感器在线', value: activeVehicles, color: 'purple' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">温度趋势</h3>
        {isLoading ? <Loading text="加载温度数据..." /> : (
          <ReactECharts option={getChartOption()} style={{ height: 320 }} notMerge={true} />
        )}
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">超温报警记录</h3>
          <span className="text-xs text-gray-400">共 {records.filter((r) => !r.withinRange).length} 条</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">时间</th>
              <th className="px-4 py-3">车辆</th>
              <th className="px-4 py-3">温区</th>
              <th className="px-4 py-3 text-right">温度(°C)</th>
              <th className="px-4 py-3">范围</th>
              <th className="px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">加载中...</td></tr>
            )}
            {!isLoading && records.filter((r) => !r.withinRange).length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">暂无超温记录</td></tr>
            )}
            {records
              .filter((r) => !r.withinRange)
              .map((r) => (
                <tr key={r._id} className="border-t border-gray-100 hover:bg-red-50">
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {dayjs(r.timestamp).format('MM-DD HH:mm')}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.vehicleId}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium" style={{ color: ZONE_COLORS[r.zone], backgroundColor: `${ZONE_COLORS[r.zone]}15` }}>
                      {ZONE_LABELS[r.zone]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-red-600 font-bold">{r.temperature.toFixed(1)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.rangeLimit ? `${r.rangeLimit.min}~${r.rangeLimit.max}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      超温
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ColdChainMonitor;
