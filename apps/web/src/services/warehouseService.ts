import axios from 'axios';
import { API_BASE } from '../config';
import type { Warehouse, WarehouseType, TemperatureZone, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface WarehouseQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  type?: WarehouseType;
  enabled?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const warehouseService = {
  getList: (params: WarehouseQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Warehouse>>>(`${API_BASE}/warehouses`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Warehouse>>(`${API_BASE}/warehouses/${id}`).then(r => r.data.data),

  create: (dto: Partial<Warehouse>) =>
    axios.post<ApiResponse<Warehouse>>(`${API_BASE}/warehouses`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<Warehouse>) =>
    axios.put<ApiResponse<Warehouse>>(`${API_BASE}/warehouses/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/warehouses/${id}`).then(r => r.data.data),

  getByType: (type: WarehouseType) =>
    axios.get<ApiResponse<Warehouse[]>>(`${API_BASE}/warehouses/type/${type}`).then(r => r.data.data),
};

export default warehouseService;
