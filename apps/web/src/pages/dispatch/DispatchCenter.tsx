import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dispatchService, { type CreateDispatchDto } from '../../services/dispatchService';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import orderService from '../../services/orderService';
import warehouseService from '../../services/warehouseService';
import type { DispatchTask, DispatchStatus, Order } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import cn from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const STATUS_LABELS: Record<string, string> = {
  pending: '待分配', assigned: '已分配', loading: '装货中',
  departed: '已发车', in_progress: '配送中', completed: '已完成', cancelled: '已取消',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600', assigned: 'bg-blue-100 text-blue-600',
  loading: 'bg-yellow-100 text-yellow-600', departed: 'bg-indigo-100 text-indigo-600',
  in_progress: 'bg-purple-100 text-purple-600', completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['assigned'],
  assigned: ['loading'],
  loading: ['departed'],
  departed: ['completed'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
};

const PRIORITY_INDICATOR: Record<string, string> = { normal: '⚪', urgent: '🟡', critical: '🔴' };

type TabKey = 'list' | 'create';

const DispatchCenter: React.FC = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<DispatchStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('list');
  const pageSize = 10;

  const [createForm, setCreateForm] = useState<CreateDispatchDto>({
    vehicleId: '', driverId: '', warehouseId: '',
    orderIds: [], priority: 'normal', temperatureZones: [], notes: '',
  });

  // Query dispatch list
  const { data: dispatchData, isLoading } = useQuery({
    queryKey: ['dispatch', page, statusFilter],
    queryFn: () => dispatchService.getList({
      page, pageSize,
      status: (statusFilter || undefined) as DispatchStatus | undefined,
      sortBy: 'createdAt', sortOrder: 'desc',
    }),
  });

  const { data: dispatchDetail } = useQuery({
    queryKey: ['dispatch', 'detail', selectedId],
    queryFn: () => dispatchService.getById(selectedId!),
    enabled: !!selectedId,
  });

  // Lookups
  const { data: vehicleList } = useQuery({
    queryKey: ['vehicles', 'lookup'], queryFn: () => vehicleService.getList({ pageSize: 100 }),
  });
  const { data: driverList } = useQuery({
    queryKey: ['drivers', 'lookup'], queryFn: () => driverService.getList({ pageSize: 100 }),
  });
  const { data: warehouseList } = useQuery({
    queryKey: ['warehouses', 'lookup'], queryFn: () => warehouseService.getList({ pageSize: 100 }),
  });
  const { data: orderList } = useQuery({
    queryKey: ['orders', 'pending'], queryFn: () => orderService.getList({ status: 'pending' as any, pageSize: 50 }),
  });

  const vehicles = (vehicleList as any)?.items || [];
  const drivers = (driverList as any)?.items || [];
  const warehouses = (warehouseList as any)?.items || [];
  const orders = (orderList as any)?.items || [];
  const tasks = (dispatchData as any)?.items || [];
  const total = (dispatchData as any)?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: CreateDispatchDto) => dispatchService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatch'] }); setTab('list'); setCreateForm({ vehicleId: '', driverId: '', warehouseId: '', orderIds: [], priority: 'normal', temperatureZones: [], notes: '' }); },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DispatchStatus }) => dispatchService.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatch'] }); qc.invalidateQueries({ queryKey: ['dispatch', 'detail'] }); },
  });

  const handleCreate = () => createMutation.mutate(createForm);
  const toggleOrder = (id: string) => setCreateForm((f) => ({ ...f, orderIds: f.orderIds.includes(id) ? f.orderIds.filter((x) => x !== id) : [...f.orderIds, id] }));

  const selectedTask = (tasks as DispatchTask[]).find((t: DispatchTask) => t._id === selectedId) || dispatchDetail;

  const detailObj = (selectedTask as any) || {};

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center">
        <h1 className="page-title">调度中心</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('list')} className={cn('px-3 py-1.5 rounded-lg text-sm', tab === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100')}>任务列表</button>
          <button onClick={() => setTab('create')} className={cn('px-3 py-1.5 rounded-lg text-sm', tab === 'create' ? 'bg-primary-600 text-white' : 'bg-gray-100')}>新建调度</button>
        </div>
      </div>

      {tab === 'list' && (
        <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
          {/* Left: Task List */}
          <div className="w-80 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as DispatchStatus | ''); setPage(1); }}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
                <option value="">全部状态</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading && <Loading text="加载中..." />}
              {tasks.map((t: DispatchTask) => (
                <div key={t._id}
                  onClick={() => setSelectedId(t._id)}
                  className={cn('p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors', selectedId === t._id && 'bg-primary-50 border-l-2 border-l-primary-500')}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-sm font-medium">{t.taskNo}</span>
                    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-xs', STATUS_COLORS[t.status])}>{STATUS_LABELS[t.status]}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>{PRIORITY_INDICATOR[(detailObj as any).priority || 'normal']} {(detailObj as any).priority || '普通'} | 订单 x{(detailObj as any).orderCount ?? t.orderIds?.length ?? 0}</div>
                    <div>总重 {(detailObj as any).totalWeight ?? '—'}kg | {dayjs(t.createdAt).fromNow()}</div>
                  </div>
                </div>
              ))}
              {!isLoading && tasks.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">暂无调度任务</div>}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between px-3 py-2 border-t border-gray-100 text-xs">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-30">‹ 上一页</button>
                <span className="text-gray-400">{page}/{totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-30">下一页 ›</button>
              </div>
            )}
          </div>

          {/* Right: Detail */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
            {!selectedId && <div className="flex items-center justify-center h-full text-gray-400">请选择左侧调度任务查看详情</div>}
            {selectedId && detailObj && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-mono">{detailObj.taskNo}</h2>
                    <span className="text-sm text-gray-500">{dayjs(detailObj.createdAt).format('YYYY-MM-DD HH:mm')} 创建</span>
                  </div>
                  <span className={cn('inline-flex px-3 py-1 rounded-full text-sm font-medium', STATUS_COLORS[detailObj.status as string])}>
                    {STATUS_LABELS[detailObj.status as string] || detailObj.status}
                  </span>
                </div>

                {STATUS_FLOW[detailObj.status as string]?.length > 0 && (
                  <div className="flex gap-2">
                    {STATUS_FLOW[detailObj.status as string].map((next: string) => (
                      <button key={next}
                        onClick={() => statusMut.mutate({ id: detailObj._id, status: next as DispatchStatus })}
                        disabled={statusMut.isPending}
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50">
                        {STATUS_LABELS[next]}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">仓库</div>
                    <div className="font-medium">{detailObj.warehouseId || '—'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">订单数</div>
                    <div className="font-medium">{(detailObj.orderCount ?? detailObj.orderIds?.length) || 0} 单</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">总重量</div>
                    <div className="font-medium">{detailObj.totalWeight || '—'} kg</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">预估距离/时长</div>
                    <div className="font-medium">{detailObj.estimatedDistance ? `${(detailObj.estimatedDistance / 1000).toFixed(1)}km` : '—'} / {detailObj.estimatedDuration ? `${Math.floor(detailObj.estimatedDuration / 60)}min` : '—'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">车辆</div>
                    <div className="font-medium">{detailObj.vehicleId || '—'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">司机</div>
                    <div className="font-medium">{detailObj.driverId || '未分配'}</div>
                  </div>
                </div>

                {detailObj.departureTime && (
                  <div className="text-sm">
                    <span className="text-gray-500">发车时间: </span>
                    <span>{dayjs(detailObj.departureTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg font-semibold">新建调度任务</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">仓库 *</label>
              <select value={createForm.warehouseId} onChange={(e) => setCreateForm((f) => ({ ...f, warehouseId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">请选择仓库</option>
                {warehouses.map((w: any) => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">车辆</label>
              <select value={createForm.vehicleId} onChange={(e) => setCreateForm((f) => ({ ...f, vehicleId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">请选择车辆</option>
                {vehicles.map((v: any) => <option key={v._id} value={v._id}>{v.plateNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">司机</label>
              <select value={createForm.driverId} onChange={(e) => setCreateForm((f) => ({ ...f, driverId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">请选择司机</option>
                {drivers.map((d: any) => <option key={d._id} value={d._id}>{d.realName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select value={createForm.priority} onChange={(e) => setCreateForm((f) => ({ ...f, priority: e.target.value as any }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="normal">普通</option>
                <option value="urgent">紧急</option>
                <option value="critical">特急</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择订单 ({createForm.orderIds.length} 已选)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {orders.map((o: Order) => (
                <label key={o._id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                  <input type="checkbox" checked={createForm.orderIds.includes(o._id)} onChange={() => toggleOrder(o._id)} />
                  <span className="font-mono text-xs">{o.orderNo}</span>
                  <span className="text-gray-500 flex-1">{o.totalAmount?.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">{dayjs(o.createdAt).format('MM-DD HH:mm')}</span>
                </label>
              ))}
              {orders.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">暂无待处理订单</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea value={createForm.notes} onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setTab('list')} className="px-4 py-2 rounded-lg border border-gray-200 text-sm">取消</button>
            <button onClick={handleCreate} disabled={createMutation.isPending || !createForm.warehouseId || !createForm.vehicleId}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50">
              {createMutation.isPending ? '提交中...' : '提交'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchCenter;
