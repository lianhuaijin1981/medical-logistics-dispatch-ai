import axios from 'axios';
import { API_BASE } from '../config';
import type { Order, OrderStatus, OrderPriority, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface OrderQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  priority?: OrderPriority;
  warehouseId?: string;
  customerId?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderDto {
  customerId: string;
  warehouseId: string;
  items: { sku: string; inventoryId: string; name: string; quantity: number; unit: string; unitPrice: number }[];
  priority?: OrderPriority;
  requestedDeliveryWindow?: { start: string; end: string };
  temperatureRequirements?: string[];
  specialInstructions?: string;
}

const orderService = {
  getList: (params: OrderQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Order>>>(`${API_BASE}/orders`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Order>>(`${API_BASE}/orders/${id}`).then(r => r.data.data),

  create: (dto: CreateOrderDto) =>
    axios.post<ApiResponse<Order>>(`${API_BASE}/orders`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<CreateOrderDto>) =>
    axios.put<ApiResponse<Order>>(`${API_BASE}/orders/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/orders/${id}`).then(r => r.data.data),

  getByStatus: (status: OrderStatus, limit = 10) =>
    axios.get<ApiResponse<Order[]>>(`${API_BASE}/orders/status/${status}`, { params: { limit } }).then(r => r.data.data),
};

export default orderService;
