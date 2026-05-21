import axios from 'axios';
import { API_BASE } from '../config';
import type { InventoryItem, TemperatureZone, InventoryClass, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface InventoryQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  sku?: string;
  name?: string;
  category?: string;
  warehouseId?: string;
  abcClass?: InventoryClass;
  temperatureZone?: TemperatureZone;
  lowStock?: boolean;
  expiring?: number; // days
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const inventoryService = {
  getList: (params: InventoryQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<InventoryItem>>>(`${API_BASE}/inventory`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<InventoryItem>>(`${API_BASE}/inventory/${id}`).then(r => r.data.data),

  create: (dto: Partial<InventoryItem>) =>
    axios.post<ApiResponse<InventoryItem>>(`${API_BASE}/inventory`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<InventoryItem>) =>
    axios.put<ApiResponse<InventoryItem>>(`${API_BASE}/inventory/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/inventory/${id}`).then(r => r.data.data),

  getLowStock: () =>
    axios.get<ApiResponse<InventoryItem[]>>(`${API_BASE}/inventory/low-stock`).then(r => r.data.data),

  getExpiring: (days = 30) =>
    axios.get<ApiResponse<InventoryItem[]>>(`${API_BASE}/inventory/expiring`, { params: { days } }).then(r => r.data.data),
};

export default inventoryService;
