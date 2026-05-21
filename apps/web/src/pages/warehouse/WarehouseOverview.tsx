import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import warehouseService from '../../services/warehouseService';
import inventoryService from '../../services/inventoryService';
import type { Warehouse, WarehouseType, InventoryItem, TemperatureZone, InventoryClass } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';
import dayjs from 'dayjs';

// ====== Constants ======
const WAREHOUSE_TYPE_LABELS: Record<string, string> = {
  central: '中央仓',
  regional: '区域仓',
  transit: '中转仓',
  cold_chain: '冷链仓',
};

const WAREHOUSE_TYPE_COLORS: Record<string, string> = {
  central: 'text-blue-600 bg-blue-50',
  regional: 'text-green-600 bg-green-50',
  transit: 'text-yellow-600 bg-yellow-50',
  cold_chain: 'text-purple-600 bg-purple-50',
};

const TEMP_ZONE_LABELS: Record<string, string> = {
  ambient: '常温',
  cool: '阴凉',
  cold: '冷藏',
  frozen: '冷冻',
};

const TEMP_ZONE_COLORS: Record<string, string> = {
  ambient: 'text-gray-600 bg-gray-100',
  cool: 'text-blue-600 bg-blue-50',
  cold: 'text-indigo-600 bg-indigo-50',
  frozen: 'text-cyan-600 bg-cyan-50',
};

const ABC_LABELS: Record<string, string> = {
  A: 'A类',
  B: 'B类',
  C: 'C类',
};

const ABC_COLORS: Record<string, string> = {
  A: 'text-red-600 bg-red-50',
  B: 'text-yellow-600 bg-yellow-50',
  C: 'text-gray-600 bg-gray-100',
};

const PAGE_SIZE = 10;

// ====== Types for forms ======
interface WarehouseForm {
  name: string;
  code: string;
  type: WarehouseType | '';
  city: string;
  district: string;
  capacity: number;
  temperatureZones: TemperatureZone[];
  enabled: boolean;
}

const initialWarehouseForm = (): WarehouseForm => ({
  name: '',
  code: '',
  type: '',
  city: '',
  district: '',
  capacity: 0,
  temperatureZones: [],
  enabled: true,
});

interface InventoryForm {
  sku: string;
  name: string;
  category: string;
  batchNo: string;
  expiryDate: string;
  temperatureZone: TemperatureZone | '';
  quantity: number;
  lockedQuantity: number;
  warehouseId: string;
  location: string;
  abcClass: InventoryClass | '';
  unit: string;
  unitPrice: number;
  safetyStock: number;
}

const initialInventoryForm = (): InventoryForm => ({
  sku: '',
  name: '',
  category: '',
  batchNo: '',
  expiryDate: '',
  temperatureZone: '',
  quantity: 0,
  lockedQuantity: 0,
  warehouseId: '',
  location: '',
  abcClass: '',
  unit: '件',
  unitPrice: 0,
  safetyStock: 0,
});

const WarehouseOverview: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'warehouse';

  // ====== Warehouse state ======
  const [wPage, setWPage] = useState(1);
  const [wKeyword, setWKeyword] = useState('');
  const [wDrawerOpen, setWDrawerOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [wForm, setWForm] = useState<WarehouseForm>(initialWarehouseForm);

  // ====== Inventory state ======
  const [iPage, setIPage] = useState(1);
  const [iKeyword, setIKeyword] = useState('');
  const [iCategory, setICategory] = useState('');
  const [iWarehouseId, setIWarehouseId] = useState('');
  const [iAbcClass, setIAbcClass] = useState('');
  const [iTempZone, setITempZone] = useState('');
  const [iLowStock, setILowStock] = useState(false);
  const [iExpiring, setIExpiring] = useState(false);
  const [iDrawerOpen, setIDrawerOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [iForm, setIForm] = useState<InventoryForm>(initialInventoryForm);

  // ====== Switch tab ======
  const switchTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // ====== Queries: Warehouses ======
  const { data: warehouseData, isLoading: wLoading } = useQuery({
    queryKey: ['warehouses', wPage, wKeyword],
    queryFn: () =>
      warehouseService.getList({
        page: wPage,
        pageSize: PAGE_SIZE,
        keyword: wKeyword || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const warehouses = (warehouseData as any)?.items || [];
  const wTotal = (warehouseData as any)?.total || 0;
  const wTotalPages = Math.ceil(wTotal / PAGE_SIZE);

  // ====== Queries: All warehouses (for inventory filter dropdown) ======
  const { data: allWarehouses } = useQuery({
    queryKey: ['warehouses', 'all'],
    queryFn: () => warehouseService.getList({ pageSize: 200 }),
    select: (data) => (data as any)?.items || [],
  });

  // ====== Queries: Inventory ======
  const { data: inventoryData, isLoading: iLoading } = useQuery({
    queryKey: ['inventory', iPage, iKeyword, iCategory, iWarehouseId, iAbcClass, iTempZone, iLowStock, iExpiring],
    queryFn: () =>
      inventoryService.getList({
        page: iPage,
        pageSize: PAGE_SIZE,
        keyword: iKeyword || undefined,
        category: iCategory || undefined,
        warehouseId: iWarehouseId || undefined,
        abcClass: (iAbcClass || undefined) as InventoryClass | undefined,
        temperatureZone: (iTempZone || undefined) as TemperatureZone | undefined,
        lowStock: iLowStock || undefined,
        expiring: iExpiring ? 30 : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const inventory = (inventoryData as any)?.items || [];
  const iTotal = (inventoryData as any)?.total || 0;
  const iTotalPages = Math.ceil(iTotal / PAGE_SIZE);

  // ====== Mutations: Warehouse ======
  const wCreateMutation = useMutation({
    mutationFn: (dto: any) => warehouseService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      closeWarehouseDrawer();
    },
  });

  const wUpdateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => warehouseService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      closeWarehouseDrawer();
    },
  });

  const wToggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      warehouseService.update(id, { enabled } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const wDeleteMutation = useMutation({
    mutationFn: (id: string) => warehouseService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  // ====== Mutations: Inventory ======
  const iCreateMutation = useMutation({
    mutationFn: (dto: any) => inventoryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      closeInventoryDrawer();
    },
  });

  const iUpdateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => inventoryService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      closeInventoryDrawer();
    },
  });

  const iDeleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  // ====== Warehouse drawer handlers ======
  const openWarehouseCreate = () => {
    setEditingWarehouse(null);
    setWForm(initialWarehouseForm());
    setWDrawerOpen(true);
  };

  const openWarehouseEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setWForm({
      name: wh.name,
      code: wh.code,
      type: wh.type,
      city: wh.address?.city || '',
      district: wh.address?.district || '',
      capacity: wh.capacity,
      temperatureZones: [...wh.temperatureZones],
      enabled: wh.enabled,
    });
    setWDrawerOpen(true);
  };

  const closeWarehouseDrawer = () => {
    setWDrawerOpen(false);
    setEditingWarehouse(null);
    setWForm(initialWarehouseForm());
  };

  const handleWarehouseSubmit = () => {
    if (!wForm.name || !wForm.code || !wForm.type) return;
    const dto: any = {
      name: wForm.name,
      code: wForm.code,
      type: wForm.type,
      address: {
        city: wForm.city,
        district: wForm.district,
        province: '',
        detail: '',
        contactName: '',
        contactPhone: '',
      },
      capacity: wForm.capacity,
      temperatureZones: wForm.temperatureZones,
      enabled: wForm.enabled,
    };
    if (editingWarehouse) {
      wUpdateMutation.mutate({ id: editingWarehouse._id, dto });
    } else {
      wCreateMutation.mutate(dto);
    }
  };

  const toggleTempZone = (zone: TemperatureZone) =>
    setWForm((f) => ({
      ...f,
      temperatureZones: f.temperatureZones.includes(zone)
        ? f.temperatureZones.filter((z) => z !== zone)
        : [...f.temperatureZones, zone],
    }));

  // ====== Inventory drawer handlers ======
  const openInventoryCreate = () => {
    setEditingInventory(null);
    setIForm(initialInventoryForm());
    setIDrawerOpen(true);
  };

  const openInventoryEdit = (item: InventoryItem) => {
    setEditingInventory(item);
    setIForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate ? dayjs(item.expiryDate).format('YYYY-MM-DD') : '',
      temperatureZone: item.temperatureZone,
      quantity: item.quantity,
      lockedQuantity: item.lockedQuantity,
      warehouseId: item.warehouseId,
      location: item.location,
      abcClass: item.abcClass,
      unit: item.unit,
      unitPrice: item.unitPrice,
      safetyStock: item.safetyStock,
    });
    setIDrawerOpen(true);
  };

  const closeInventoryDrawer = () => {
    setIDrawerOpen(false);
    setEditingInventory(null);
    setIForm(initialInventoryForm());
  };

  const handleInventorySubmit = () => {
    if (!iForm.sku || !iForm.name || !iForm.warehouseId) return;
    const dto: any = {
      ...iForm,
      temperatureZone: iForm.temperatureZone || undefined,
      abcClass: iForm.abcClass || undefined,
    };
    if (editingInventory) {
      iUpdateMutation.mutate({ id: editingInventory._id, dto });
    } else {
      iCreateMutation.mutate(dto);
    }
  };

  // ====== Pagination helper ======
  const renderPagination = (page: number, totalPages: number, total: number, setPage: (n: number) => void) => {
    if (totalPages <= 1) return null;
    const btnBase =
      'px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors';
    const btnActive = 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700';

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const startPages = pages.slice(0, 5);
    const endPages = pages.slice(-2);
    const showStart = pages.length > 7;
    const showEnd = pages.length > 7 && endPages[0] > startPages[4] + 1;

    return (
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          共 {total} 条，第 {page}/{totalPages} 页
        </span>
        <div className="flex items-center gap-1">
          <button
            className={btnBase}
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            上一页
          </button>
          {startPages.map((n) => (
            <button
              key={n}
              className={cn(btnBase, page === n && btnActive)}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          {showStart && showEnd && <span className="px-2 text-gray-400">...</span>}
          {showEnd &&
            endPages.map((n) => (
              <button
                key={n}
                className={cn(btnBase, page === n && btnActive)}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          <button
            className={btnBase}
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            下一页
          </button>
        </div>
      </div>
    );
  };

  // ====== Expiry date highlight ======
  const getExpiryClass = (expiryDate: string) => {
    const days = dayjs(expiryDate).diff(dayjs(), 'day');
    if (days <= 30) return 'text-red-600 font-medium';
    if (days <= 90) return 'text-orange-500 font-medium';
    return '';
  };

  const wMutating = wCreateMutation.isPending || wUpdateMutation.isPending || wToggleMutation.isPending || wDeleteMutation.isPending;
  const iMutating = iCreateMutation.isPending || iUpdateMutation.isPending || iDeleteMutation.isPending;

  // ====== Render ======
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">仓储管理</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6 border-b border-gray-200">
        <button
          onClick={() => switchTab('warehouse')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'warehouse'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          仓库管理
        </button>
        <button
          onClick={() => switchTab('inventory')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'inventory'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          库存管理
        </button>
      </div>

      {/* ====== Warehouse Tab ====== */}
      {activeTab === 'warehouse' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="搜索仓库名称、编码..."
              value={wKeyword}
              onChange={(e) => {
                setWKeyword(e.target.value);
                setWPage(1);
              }}
              className="w-72 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
            />
            <button
              onClick={openWarehouseCreate}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700"
            >
              + 新建仓库
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {wLoading ? (
              <Loading text="加载仓库数据..." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">名称</th>
                      <th className="px-4 py-3 font-medium">编码</th>
                      <th className="px-4 py-3 font-medium">类型</th>
                      <th className="px-4 py-3 font-medium">地址</th>
                      <th className="px-4 py-3 font-medium text-right">容量</th>
                      <th className="px-4 py-3 font-medium">温区</th>
                      <th className="px-4 py-3 font-medium text-center">状态</th>
                      <th className="px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {warehouses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                          暂无仓库数据
                        </td>
                      </tr>
                    ) : (
                      warehouses.map((wh: Warehouse) => (
                        <tr key={wh._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{wh.name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{wh.code}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                WAREHOUSE_TYPE_COLORS[wh.type] || 'text-gray-600 bg-gray-100',
                              )}
                            >
                              {WAREHOUSE_TYPE_LABELS[wh.type] || wh.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {wh.address?.city || ''} {wh.address?.district || ''}
                          </td>
                          <td className="px-4 py-3 text-right">{wh.capacity?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {wh.temperatureZones?.map((zone) => (
                                <span
                                  key={zone}
                                  className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded text-xs',
                                    TEMP_ZONE_COLORS[zone] || 'text-gray-600 bg-gray-100',
                                  )}
                                >
                                  {TEMP_ZONE_LABELS[zone] || zone}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                wToggleMutation.mutate({ id: wh._id, enabled: !wh.enabled })
                              }
                              disabled={wMutating}
                              className={cn(
                                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                                wh.enabled ? 'bg-primary-600' : 'bg-gray-300',
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                                  wh.enabled ? 'translate-x-4' : 'translate-x-0.5',
                                )}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openWarehouseEdit(wh)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('确认删除此仓库？')) {
                                    wDeleteMutation.mutate(wh._id);
                                  }
                                }}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPagination(wPage, wTotalPages, wTotal, setWPage)}
          </div>

          {/* Warehouse Drawer */}
          {wDrawerOpen && (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/30" onClick={closeWarehouseDrawer} />
              <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white shadow-xl flex flex-col z-50">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">
                    {editingWarehouse ? '编辑仓库' : '新建仓库'}
                  </h3>
                  <button onClick={closeWarehouseDrawer} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称 <span className="text-red-500">*</span></label>
                    <input
                      value={wForm.name}
                      onChange={(e) => setWForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">编码 <span className="text-red-500">*</span></label>
                    <input
                      value={wForm.code}
                      onChange={(e) => setWForm((f) => ({ ...f, code: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">类型 <span className="text-red-500">*</span></label>
                    <select
                      value={wForm.type}
                      onChange={(e) => setWForm((f) => ({ ...f, type: e.target.value as WarehouseType }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="">请选择类型</option>
                      {Object.entries(WAREHOUSE_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
                      <input
                        value={wForm.city}
                        onChange={(e) => setWForm((f) => ({ ...f, city: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">区县</label>
                      <input
                        value={wForm.district}
                        onChange={(e) => setWForm((f) => ({ ...f, district: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">容量</label>
                    <input
                      type="number"
                      value={wForm.capacity}
                      onChange={(e) => setWForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">温区</label>
                    <div className="flex flex-wrap gap-2">
                      {(['ambient', 'cool', 'cold', 'frozen'] as TemperatureZone[]).map((zone) => (
                        <button
                          key={zone}
                          onClick={() => toggleTempZone(zone)}
                          className={cn(
                            'px-3 py-1 text-xs rounded-full border transition-colors',
                            wForm.temperatureZones.includes(zone)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300',
                          )}
                        >
                          {TEMP_ZONE_LABELS[zone]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                  <button onClick={closeWarehouseDrawer} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    取消
                  </button>
                  <button
                    onClick={handleWarehouseSubmit}
                    disabled={!wForm.name || !wForm.code || !wForm.type || wMutating}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {wCreateMutation.isPending || wUpdateMutation.isPending ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====== Inventory Tab ====== */}
      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="搜索 SKU、商品名..."
                value={iKeyword}
                onChange={(e) => {
                  setIKeyword(e.target.value);
                  setIPage(1);
                }}
                className="w-52 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
              />
              <select
                value={iCategory}
                onChange={(e) => {
                  setICategory(e.target.value);
                  setIPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
              >
                <option value="">全部分类</option>
                <option value="药品">药品</option>
                <option value="医疗器械">医疗器械</option>
                <option value="试剂">试剂</option>
                <option value="耗材">耗材</option>
              </select>
              <select
                value={iWarehouseId}
                onChange={(e) => {
                  setIWarehouseId(e.target.value);
                  setIPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
              >
                <option value="">全部仓库</option>
                {(allWarehouses || []).map((w: any) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
              <select
                value={iAbcClass}
                onChange={(e) => {
                  setIAbcClass(e.target.value);
                  setIPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
              >
                <option value="">ABC分类</option>
                <option value="A">A类</option>
                <option value="B">B类</option>
                <option value="C">C类</option>
              </select>
              <select
                value={iTempZone}
                onChange={(e) => {
                  setITempZone(e.target.value);
                  setIPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
              >
                <option value="">全部温区</option>
                {Object.entries(TEMP_ZONE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iLowStock}
                  onChange={(e) => {
                    setILowStock(e.target.checked);
                    setIPage(1);
                  }}
                  className="rounded border-gray-300"
                />
                仅显示低库存
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iExpiring}
                  onChange={(e) => {
                    setIExpiring(e.target.checked);
                    setIPage(1);
                  }}
                  className="rounded border-gray-300"
                />
                仅显示临期(30天内)
              </label>
              <div className="ml-auto">
                <button
                  onClick={openInventoryCreate}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700"
                >
                  + 新增库存
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {iLoading ? (
              <Loading text="加载库存数据..." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">SKU</th>
                      <th className="px-4 py-3 font-medium">名称</th>
                      <th className="px-4 py-3 font-medium">分类</th>
                      <th className="px-4 py-3 font-medium">批号</th>
                      <th className="px-4 py-3 font-medium">效期</th>
                      <th className="px-4 py-3 font-medium">温区</th>
                      <th className="px-4 py-3 font-medium text-right">数量</th>
                      <th className="px-4 py-3 font-medium text-right">锁定</th>
                      <th className="px-4 py-3 font-medium">货位</th>
                      <th className="px-4 py-3 font-medium">ABC</th>
                      <th className="px-4 py-3 font-medium text-right">单价</th>
                      <th className="px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                          暂无库存数据
                        </td>
                      </tr>
                    ) : (
                      inventory.map((item: InventoryItem) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{item.category}</td>
                          <td className="px-4 py-3 font-mono text-xs">{item.batchNo}</td>
                          <td className={cn('px-4 py-3 text-xs', getExpiryClass(item.expiryDate))}>
                            {item.expiryDate ? dayjs(item.expiryDate).format('YYYY-MM-DD') : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded text-xs',
                                TEMP_ZONE_COLORS[item.temperatureZone] || 'text-gray-600 bg-gray-100',
                              )}
                            >
                              {TEMP_ZONE_LABELS[item.temperatureZone] || item.temperatureZone}
                            </span>
                          </td>
                          <td className={cn(
                            'px-4 py-3 text-right font-mono',
                            item.quantity <= item.safetyStock && 'text-red-600 font-medium',
                          )}>
                            {item.quantity?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-400">
                            {item.lockedQuantity?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.location}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                ABC_COLORS[item.abcClass] || 'text-gray-600 bg-gray-100',
                              )}
                            >
                              {ABC_LABELS[item.abcClass] || item.abcClass}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs">
                            ¥{item.unitPrice?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openInventoryEdit(item)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('确认删除此库存记录？')) {
                                    iDeleteMutation.mutate(item._id);
                                  }
                                }}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPagination(iPage, iTotalPages, iTotal, setIPage)}
          </div>

          {/* Inventory Drawer */}
          {iDrawerOpen && (
            <div className="fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/30" onClick={closeInventoryDrawer} />
              <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white shadow-xl flex flex-col z-50">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">
                    {editingInventory ? '编辑库存' : '新增库存'}
                  </h3>
                  <button onClick={closeInventoryDrawer} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU <span className="text-red-500">*</span></label>
                    <input
                      value={iForm.sku}
                      onChange={(e) => setIForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称 <span className="text-red-500">*</span></label>
                    <input
                      value={iForm.name}
                      onChange={(e) => setIForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select
                      value={iForm.category}
                      onChange={(e) => setIForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="">请选择分类</option>
                      <option value="药品">药品</option>
                      <option value="医疗器械">医疗器械</option>
                      <option value="试剂">试剂</option>
                      <option value="耗材">耗材</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">批号</label>
                      <input
                        value={iForm.batchNo}
                        onChange={(e) => setIForm((f) => ({ ...f, batchNo: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">效期</label>
                      <input
                        type="date"
                        value={iForm.expiryDate}
                        onChange={(e) => setIForm((f) => ({ ...f, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仓库 <span className="text-red-500">*</span></label>
                    <select
                      value={iForm.warehouseId}
                      onChange={(e) => setIForm((f) => ({ ...f, warehouseId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="">请选择仓库</option>
                      {(allWarehouses || []).map((w: any) => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">温区</label>
                    <select
                      value={iForm.temperatureZone}
                      onChange={(e) => setIForm((f) => ({ ...f, temperatureZone: e.target.value as TemperatureZone }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    >
                      <option value="">请选择温区</option>
                      {Object.entries(TEMP_ZONE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">货位</label>
                    <input
                      value={iForm.location}
                      onChange={(e) => setIForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                      <input
                        type="number"
                        value={iForm.quantity}
                        onChange={(e) => setIForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">锁定数量</label>
                      <input
                        type="number"
                        value={iForm.lockedQuantity}
                        onChange={(e) => setIForm((f) => ({ ...f, lockedQuantity: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ABC分类</label>
                      <select
                        value={iForm.abcClass}
                        onChange={(e) => setIForm((f) => ({ ...f, abcClass: e.target.value as InventoryClass }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      >
                        <option value="">请选择</option>
                        <option value="A">A类</option>
                        <option value="B">B类</option>
                        <option value="C">C类</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">安全库存</label>
                      <input
                        type="number"
                        value={iForm.safetyStock}
                        onChange={(e) => setIForm((f) => ({ ...f, safetyStock: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                      <input
                        value={iForm.unit}
                        onChange={(e) => setIForm((f) => ({ ...f, unit: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">单价</label>
                      <input
                        type="number"
                        value={iForm.unitPrice}
                        onChange={(e) => setIForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                  <button onClick={closeInventoryDrawer} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    取消
                  </button>
                  <button
                    onClick={handleInventorySubmit}
                    disabled={!iForm.sku || !iForm.name || !iForm.warehouseId || iMutating}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {iCreateMutation.isPending || iUpdateMutation.isPending ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WarehouseOverview;
