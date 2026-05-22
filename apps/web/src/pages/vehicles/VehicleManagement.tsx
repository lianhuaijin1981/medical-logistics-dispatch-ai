import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehicleService, { type CreateVehicleDto } from '../../services/vehicleService';
import type { Vehicle, VehicleStatus, VehicleType } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';
import dayjs from 'dayjs';

const TYPE_LABELS: Record<string, string> = {
  van: '厢式货车',
  truck: '大型卡车',
  refrigerated: '冷藏车',
  ev: '新能源车',
};

const TYPE_COLORS: Record<string, string> = {
  van: 'text-blue-600 bg-blue-50',
  truck: 'text-green-600 bg-green-50',
  refrigerated: 'text-cyan-600 bg-cyan-50',
  ev: 'text-purple-600 bg-purple-50',
};

const STATUS_LABELS: Record<string, string> = {
  available: '空闲',
  on_trip: '配送中',
  maintenance: '维修中',
  offline: '离线',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'text-green-600 bg-green-50',
  on_trip: 'text-blue-600 bg-blue-50',
  maintenance: 'text-orange-600 bg-orange-50',
  offline: 'text-gray-400 bg-gray-100',
};

const PAGE_SIZE = 10;

interface VehicleForm {
  plateNumber: string;
  brand: string;
  vehicleModel: string;
  year: number;
  type: VehicleType;
  capacity: number;
  maxWeight: number;
  temperatureZones: string[];
  enabled: boolean;
}

const initialForm = (): VehicleForm => ({
  plateNumber: '',
  brand: '',
  vehicleModel: '',
  year: new Date().getFullYear(),
  type: 'van' as VehicleType,
  capacity: 1000,
  maxWeight: 2000,
  temperatureZones: [],
  enabled: true,
});

const VehicleManagement: React.FC = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleForm>(initialForm());

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', page, keyword, typeFilter, statusFilter],
    queryFn: () =>
      vehicleService.getList({
        page,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        type: (typeFilter || undefined) as VehicleType | undefined,
        status: (statusFilter || undefined) as VehicleStatus | undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const vehicles: Vehicle[] = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const createMut = useMutation({
    mutationFn: (dto: CreateVehicleDto) => vehicleService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); closeDrawer(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateVehicleDto> }) =>
      vehicleService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); closeDrawer(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => vehicleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VehicleStatus }) =>
      vehicleService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const openCreate = () => { setEditing(null); setForm(initialForm()); setDrawerOpen(true); };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      plateNumber: v.plateNumber,
      brand: v.brand || '',
      vehicleModel: v.vehicleModel || '',
      year: v.year || new Date().getFullYear(),
      type: v.type,
      capacity: v.capacity || 0,
      maxWeight: v.maxWeight || 0,
      temperatureZones: [...(v.temperatureZones || [])],
      enabled: v.enabled ?? true,
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const toggleZone = (zone: string) =>
    setForm((f) => ({
      ...f,
      temperatureZones: f.temperatureZones?.includes(zone)
        ? f.temperatureZones.filter((z: string) => z !== zone)
        : [...(f.temperatureZones || []), zone],
    }));

  const handleSubmit = () => {
    if (!form.plateNumber) return;
    const dto: CreateVehicleDto = {
      plateNumber: form.plateNumber,
      brand: form.brand,
      vehicleModel: form.vehicleModel,
      year: form.year,
      type: form.type,
      capacity: form.capacity,
      maxWeight: form.maxWeight,
      temperatureZones: form.temperatureZones,
    };
    if (editing) {
      updateMut.mutate({ id: editing._id, dto });
    } else {
      createMut.mutate(dto);
    }
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">车辆管理</h1>
        <button onClick={openCreate} className="btn-primary">+ 新建车辆</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="搜索车牌号..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="w-56 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as VehicleType | ''); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
        >
          <option value="">全部类型</option>
          {Object.entries(TYPE_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as VehicleStatus | ''); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
        >
          <option value="">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => { setKeyword(''); setTypeFilter(''); setStatusFilter(''); setPage(1); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >重置筛选</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading text="加载车辆数据..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">车牌号</th>
                  <th className="px-4 py-3 font-medium">品牌/型号</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium text-right">载重(kg)</th>
                  <th className="px-4 py-3 font-medium text-right">最大载重(kg)</th>
                  <th className="px-4 py-3 font-medium">温区</th>
                  <th className="px-4 py-3 font-medium text-center">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">暂无车辆数据</td></tr>
                )}
                {vehicles.map((v: Vehicle) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{v.plateNumber}</td>
                    <td className="px-4 py-3 text-sm">{v.brand} {v.vehicleModel}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[v.type] || 'text-gray-600 bg-gray-100')}>
                        {TYPE_LABELS[v.type] || v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">{v.capacity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm">{v.maxWeight?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(v.temperatureZones || []).map((z: string) => (
                          <span key={z} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700">
                            {z === 'ambient' ? '常温' : z === 'cool' ? '阴凉' : z === 'cold' ? '冷藏' : '冷冻'}
                          </span>
                        ))}
                        {(!v.temperatureZones || v.temperatureZones.length === 0) && <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={v.status}
                        onChange={(e) => statusMut.mutate({ id: v._id, status: e.target.value as VehicleStatus })}
                        disabled={statusMut.isPending}
                        className={cn('text-xs rounded border-0 px-2 py-1 cursor-pointer', STATUS_COLORS[v.status] || 'text-gray-600 bg-gray-100')}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(v)} className="text-xs text-gray-500 hover:text-primary-600">编辑</button>
                        <button
                          onClick={() => window.confirm('确认删除此车辆？') && deleteMut.mutate(v._id)}
                          className="text-xs text-gray-500 hover:text-red-600"
                        >删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">共 {total} 条，第 {page}/{totalPages} 页</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">上一页</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white shadow-xl flex flex-col z-50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{editing ? '编辑车辆' : '新建车辆'}</h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">车牌号 <span className="text-red-500">*</span></label>
                <input
                  value={form.plateNumber}
                  onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                  placeholder="如：沪A12345"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    placeholder="如：解放"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型号</label>
                  <input
                    value={form.vehicleModel}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleModel: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    placeholder="如：J6P"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VehicleType }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">载重(kg)</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大载重(kg)</label>
                  <input
                    type="number"
                    value={form.maxWeight}
                    onChange={(e) => setForm((f) => ({ ...f, maxWeight: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">温区</label>
                <div className="flex flex-wrap gap-2">
                  {(['ambient', 'cool', 'cold', 'frozen'] as const).map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => toggleZone(zone)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        form.temperatureZones?.includes(zone)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300',
                      )}
                    >
                      {{ ambient: '常温', cool: '阴凉', cold: '冷藏', frozen: '冷冻' }[zone]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                  className="rounded border-gray-300"
                  id="vehicle-enabled"
                />
                <label htmlFor="vehicle-enabled" className="text-sm text-gray-700 cursor-pointer">启用</label>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={closeDrawer} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
              <button
                onClick={handleSubmit}
                disabled={!form.plateNumber || isMutating}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >{isMutating ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
