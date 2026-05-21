import axios from 'axios';
import { API_BASE } from '../config';
import type { ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface PickingQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  status?: string;
  warehouseId?: string;
  method?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const pickingService = {
  getList: (params: PickingQuery = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return axios.get<ApiResponse<PaginatedResponse<any>>>(`${API_BASE}/picking${qs ? '?' + qs : ''}`).then((r: any) => r.data.data);
  },

  getById: (id: string) => axios.get<ApiResponse<any>>(`${API_BASE}/picking/${id}`).then((r: any) => r.data.data),

  create: (dto: any) => axios.post<ApiResponse<any>>(`${API_BASE}/picking`, dto).then((r: any) => r.data.data),

  update: (id: string, dto: any) =>
    axios.put<ApiResponse<any>>(`${API_BASE}/picking/${id}`, dto).then((r: any) => r.data.data),

  remove: (id: string) => axios.delete<ApiResponse<void>>(`${API_BASE}/picking/${id}`).then((r: any) => r.data.data),
};

export default pickingService;
