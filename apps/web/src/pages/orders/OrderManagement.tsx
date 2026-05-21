import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import warehouseService from '../../services/warehouseService';
import type { Order, OrderPriority } from '@med/shared-types';
import { OrderStatus } from '@med/shared-types';
import type { CreateOrderDto } from '../../services/orderService';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';
import dayjs from 'dayjs';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'picking', label: '拣货中' },
  { key: 'picked', label: '已拣货' },
  { key: 'dispatching', label: '派车中' },
  { key: 'in_transit', label: '运输中' },
  { key: 'delivered', label: '已送达' },
  { key: 'cancelled', label: '已取消' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  picking: '拣货中',
  picked: '已拣货',
  dispatching: '派车中',
  in_transit: '运输中',
  delivered: '已送达',
  cancelled: '已取消',
  exception: '异常',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  picking: 'text-indigo-600 bg-indigo-50',
  picked: 'text-cyan-600 bg-cyan-50',
  dispatching: 'text-purple-600 bg-purple-50',
  in_transit: 'text-blue-600 bg-blue-100',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
  exception: 'text-orange-600 bg-orange-50',
};

const PRIORITY_LABELS: Record<string, string> = {
  normal: '普通',
  urgent: '紧急',
  critical: '特急',
};

const PRIORITY_COLORS: Record<string, string> = {
  normal: 'text-blue-600 bg-blue-50',
  urgent: 'text-yellow-600 bg-yellow-50',
  critical: 'text-red-600 bg-red-50',
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['picking', 'cancelled'],
  picking: ['picked', 'cancelled'],
  picked: ['dispatching', 'cancelled'],
  dispatching: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  exception: [],
};

const PAGE_SIZE = 10;

interface OrderItemForm {
  sku: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

const emptyItem = (): OrderItemForm => ({
  sku: '',
  inventoryId: '',
  name: '',
  quantity: 1,
  unit: '件',
  unitPrice: 0,
});

const initialForm = (): CreateOrderDto => ({
  customerId: '',
  warehouseId: '',
  items: [emptyItem()],
  priority: 'normal' as OrderPriority,
  temperatureRequirements: [],
  specialInstructions: '',
});

const OrderManagement: React.FC = () => {
  const queryClient = useQueryClient();

  // Filter/paginate state
  const [activeStatus, setActiveStatus] = useState('');
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<CreateOrderDto>(initialForm);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('');

  // ====== Queries ======
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['orders', page, activeStatus, keyword],
    queryFn: () =>
      orderService.getList({
        page,
        pageSize: PAGE_SIZE,
        status: (activeStatus || undefined) as OrderStatus | undefined,
        keyword: keyword || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const { data: customerData = [] } = useQuery({
    queryKey: ['customers', 'lookup', customerSearch],
    queryFn: async () => {
      if (customerSearch) {
        return customerService.search(customerSearch);
      }
      const paginated = await customerService.getList({ pageSize: 100 });
      return paginated.items;
    },
  });

  const { data: warehouseData = [] } = useQuery({
    queryKey: ['warehouses', 'lookup'],
    queryFn: async () => {
      const paginated = await warehouseService.getList({ pageSize: 100 });
      return paginated.items;
    },
  });

  // ====== Helper: resolve customer/warehouse names ======
  const customers = customerData || [];
  const warehouses = warehouseData || [];

  const getCustomerName = useCallback(
    (id: string) => (customers as any[]).find((c: any) => c._id === id)?.name || id,
    [customers],
  );

  const getWarehouseName = useCallback(
    (id: string) => (warehouses as any[]).find((w: any) => w._id === id)?.name || id,
    [warehouses],
  );

  // ====== Mutations ======
  const createMutation = useMutation({
    mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      closeDrawer();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateOrderDto> }) =>
      orderService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      closeDrawer();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.update(id, { status } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // ====== Handlers ======
  const openCreate = () => {
    setEditingOrder(null);
    setForm(initialForm());
    setDrawerOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setForm({
      customerId: order.customerId,
      warehouseId: order.warehouseId,
      items: order.items.map((it) => ({ ...it })),
      priority: order.priority,
      temperatureRequirements: [...order.temperatureRequirements],
      specialInstructions: order.specialInstructions || '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingOrder(null);
    setForm(initialForm());
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.warehouseId || form.items.length === 0) return;
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder._id, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleStatusChange = (order: Order, nextStatus: string) => {
    statusMutation.mutate({ id: order._id, status: nextStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确认删除此订单？')) {
      deleteMutation.mutate(id);
    }
  };

  // Item row management
  const addItem = () => setForm((f: CreateOrderDto) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx: number) =>
    setForm((f: CreateOrderDto) => ({ ...f, items: f.items.filter((_: OrderItemForm, i: number) => i !== idx) }));
  const updateItem = (idx: number, patch: Partial<OrderItemForm>) =>
    setForm((f: CreateOrderDto) => ({
      ...f,
      items: f.items.map((it: OrderItemForm, i: number) => (i === idx ? { ...it, ...patch } : it)),
    }));

  const toggleTemp = (zone: string) =>
    setForm((f: CreateOrderDto) => ({
      ...f,
      temperatureRequirements: f.temperatureRequirements?.includes(zone)
        ? f.temperatureRequirements.filter((z: string) => z !== zone)
        : [...(f.temperatureRequirements || []), zone],
    }));

  // ====== Computed ======
  const orders = (orderData as any)?.items || [];
  const total = (orderData as any)?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ====== Pagination ======
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startPages = pages.slice(0, 5);
  const endPages = pages.slice(-2);
  const showStart = pages.length > 7;
  const showEnd = pages.length > 7 && endPages[0] > startPages[4] + 1;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const btnBase =
      'px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors';
    const btnActive = 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700';

    return (
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          共 {total} 条，第 {page}/{totalPages} 页
        </span>
        <div className="flex items-center gap-1">
          <button
            className={btnBase}
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>
      </div>
    );
  };

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending;

  // ====== Render ======
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">订单管理</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700"
        >
          + 新建订单
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveStatus(tab.key);
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              activeStatus === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索订单号、客户名称..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="w-80 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading text="加载订单数据..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">订单号</th>
                  <th className="px-4 py-3 font-medium">客户</th>
                  <th className="px-4 py-3 font-medium">仓库</th>
                  <th className="px-4 py-3 font-medium text-center">商品数</th>
                  <th className="px-4 py-3 font-medium text-right">金额</th>
                  <th className="px-4 py-3 font-medium">优先级</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">创建时间</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      暂无订单数据
                    </td>
                  </tr>
                ) : (
                  orders.map((order: Order) => {
                    const transitions = ALLOWED_TRANSITIONS[order.status] || [];
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
                        <td className="px-4 py-3">{getCustomerName(order.customerId)}</td>
                        <td className="px-4 py-3">{getWarehouseName(order.warehouseId)}</td>
                        <td className="px-4 py-3 text-center">{order.items?.length || 0}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          ¥{order.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              PRIORITY_COLORS[order.priority] || 'text-gray-600 bg-gray-100',
                            )}
                          >
                            {PRIORITY_LABELS[order.priority] || order.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              STATUS_COLORS[order.status] || 'text-gray-600 bg-gray-100',
                            )}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {transitions.map((next) => (
                              <button
                                key={next}
                                onClick={() => handleStatusChange(order, next)}
                                disabled={isMutating}
                                className={cn(
                                  'px-2 py-1 text-xs rounded transition-colors',
                                  STATUS_COLORS[next],
                                  'hover:opacity-80',
                                )}
                              >
                                {next === 'cancelled' ? '取消' : STATUS_LABELS[next]}
                              </button>
                            ))}
                            {transitions.length === 0 && order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <span className="text-xs text-gray-400">--</span>
                            )}
                            <button
                              onClick={() => openEdit(order)}
                              className="px-2 py-1 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(order._id)}
                              className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {renderPagination()}
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white shadow-xl flex flex-col z-50">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {editingOrder ? '编辑订单' : '新建订单'}
              </h3>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户 <span className="text-red-500">*</span></label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm((f: CreateOrderDto) => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="">请选择客户</option>
                  {(customers as any[]).map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warehouse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">仓库 <span className="text-red-500">*</span></label>
                <select
                  value={form.warehouseId}
                  onChange={(e) => setForm((f: CreateOrderDto) => ({ ...f, warehouseId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="">请选择仓库</option>
                  {(warehouses as any[]).map((w: any) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">订单商品</label>
                  <button
                    onClick={addItem}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    + 添加商品
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-100 rounded-lg bg-gray-50 space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          placeholder="SKU"
                          value={item.sku}
                          onChange={(e) => updateItem(idx, { sku: e.target.value })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                        <input
                          placeholder="商品名"
                          value={item.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="数量"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(idx, { quantity: Number(e.target.value) })
                          }
                          className="w-20 px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                        <input
                          placeholder="单位"
                          value={item.unit}
                          onChange={(e) => updateItem(idx, { unit: e.target.value })}
                          className="w-20 px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                        <input
                          type="number"
                          placeholder="单价"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, { unitPrice: Number(e.target.value) })
                          }
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                        <button
                          onClick={() => removeItem(idx)}
                          className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f: CreateOrderDto) => ({ ...f, priority: e.target.value as OrderPriority }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                >
                  <option value="normal">普通</option>
                  <option value="urgent">紧急</option>
                  <option value="critical">特急</option>
                </select>
              </div>

              {/* Temperature requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">温度要求</label>
                <div className="flex flex-wrap gap-2">
                  {(['ambient', 'cool', 'cold', 'frozen'] as const).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => toggleTemp(zone)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        form.temperatureRequirements?.includes(zone)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300',
                      )}
                    >
                      {{ ambient: '常温', cool: '阴凉', cold: '冷藏', frozen: '冷冻' }[zone]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">特殊说明</label>
                <textarea
                  value={form.specialInstructions}
                  onChange={(e) =>
                    setForm((f: CreateOrderDto) => ({ ...f, specialInstructions: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 resize-none"
                  placeholder="请输入特殊说明..."
                />
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeDrawer}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  !form.customerId ||
                  !form.warehouseId ||
                  form.items.length === 0 ||
                  isMutating
                }
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
