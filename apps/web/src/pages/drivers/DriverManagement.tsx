import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import driverService from '../../services/driverService';
import type { Driver, DriverStatus } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';

const STATUS_LABELS: Record<string, string> = {
  available: '空闲',
  on_trip: '配送中',
  off_duty: '下班',
  on_leave: '休假',
  inactive: '停用',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'text-green-600 bg-green-50',
  on_trip: 'text-blue-600 bg-blue-50',
  off_duty: 'text-gray-500 bg-gray-100',
  on_leave: 'text-yellow-600 bg-yellow-50',
  inactive: 'text-red-400 bg-red-50',
};

const PAGE_SIZE = 10;

interface DriverForm {
  realName: string;
  licenseNumber: string;
  licenseType: string;
  phone: string;
  certifications: string[];
  currentVehicleId: string;
  status: DriverStatus;
}

const initialForm = (): DriverForm => ({
  realName: '',
  licenseNumber: '',
  licenseType: 'C1',
  phone: '',
  certifications: [],
  currentVehicleId: '',
  status: 'available' as DriverStatus,
});

const DriverManagement: React.FC = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(initialForm());
  const [certInput, setCertInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', page, keyword, statusFilter],
    queryFn: () =>
      driverService.getList({
        page,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        status: (statusFilter || undefined) as DriverStatus | undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const drivers: Driver[] = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const createMut = useMutation({
    mutationFn: (dto: any) => driverService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); closeDrawer(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      driverService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); closeDrawer(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => driverService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DriverStatus }) =>
      driverService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const addCert = () => {
    if (!certInput) return;
    setForm((f) => ({ ...f, certifications: [...f.certifications, certInput] }));
    setCertInput('');
  };

  const removeCert = (idx: number) => {
    setForm((f) => ({ ...f, certifications: f.certifications.filter((_: string, i: number) => i !== idx) }));
  };

  const openCreate = () => { setEditing(null); setForm(initialForm()); setDrawerOpen(true); };
  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      realName: d.realName,
      licenseNumber: d.licenseNumber,
      licenseType: d.licenseType || 'C1',
      phone: d.phone,
      certifications: [...(d.certifications || [])],
      currentVehicleId: d.currentVehicleId || '',
      status: d.status,
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.realName || !form.licenseNumber || !form.phone) return;
    const dto: any = { ...form };
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
        <h1 className="page-title">司机管理</h1>
        <button onClick={openCreate} className="btn-primary">+ 新建司机</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="搜索姓名、手机号、驾驶证号..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="w-64 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as DriverStatus | ''); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
        >
          <option value="">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => { setKeyword(''); setStatusFilter(''); setPage(1); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >重置筛选</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading text="加载司机数据..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">驾驶证号</th>
                  <th className="px-4 py-3 font-medium">准驾车型</th>
                  <th className="px-4 py-3 font-medium">手机号</th>
                  <th className="px-4 py-3 font-medium">资质证书</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drivers.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">暂无司机数据</td></tr>
                )}
                {drivers.map((d: Driver) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.realName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.licenseNumber}</td>
                    <td className="px-4 py-3 text-xs">{d.licenseType}</td>
                    <td className="px-4 py-3 font-mono text-sm">{d.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(d.certifications || []).map((c: string, i: number) => (
                          <span key={i} className="inline-flex px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{c}</span>
                        ))}
                        {(!d.certifications || d.certifications.length === 0) && <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={d.status}
                        onChange={(e) => toggleStatusMut.mutate({ id: d._id, status: e.target.value as DriverStatus })}
                        disabled={toggleStatusMut.isPending}
                        className={cn('text-xs rounded border-0 px-2 py-1 cursor-pointer', STATUS_COLORS[d.status] || 'text-gray-600 bg-gray-100')}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(d)} className="text-xs text-gray-500 hover:text-primary-600">编辑</button>
                        <button
                          onClick={() => window.confirm('确认删除此司机？') && deleteMut.mutate(d._id)}
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
              <h3 className="text-base font-semibold text-gray-900">{editing ? '编辑司机' : '新建司机'}</h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                <input
                  value={form.realName}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">驾驶证号 <span className="text-red-500">*</span></label>
                  <input
                    value={form.licenseNumber}
                    onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">准驾车型</label>
                  <select
                    value={form.licenseType}
                    onChange={(e) => setForm((f) => ({ ...f, licenseType: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="A1">A1（大型客车）</option>
                    <option value="A2">A2（牵引车）</option>
                    <option value="B1">B1（中型客车）</option>
                    <option value="B2">B2（大型货车）</option>
                    <option value="C1">C1（小型汽车）</option>
                    <option value="C2">C2（自动挡）</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号 <span className="text-red-500">*</span></label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资质证书</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.certifications.map((c: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                      {c}
                      <button onClick={() => removeCert(idx)} className="hover:text-blue-900">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="输入证书名回车"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <button onClick={addCert} className="text-xs text-primary-600">添加</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DriverStatus }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={closeDrawer} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
              <button
                onClick={handleSubmit}
                disabled={!form.realName || !form.licenseNumber || !form.phone || isMutating}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >{isMutating ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
