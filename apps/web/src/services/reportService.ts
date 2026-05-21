import axios from 'axios';
import { API_BASE } from '../config';
import type { ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface CreateReportDto {
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'inventory' | 'performance' | 'temperature' | 'financial';
  dateRange: { start: string; end: string };
  warehouseId?: string;
  schedule?: { frequency: 'none' | 'daily' | 'weekly' | 'monthly'; nextRunAt?: string };
}

const reportService = {
  getList: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return axios.get<ApiResponse<PaginatedResponse<any>>>(`${API_BASE}/reports${qs ? '?' + qs : ''}`)
      .then((r: any) => r.data.data);
  },

  getById: (id: string) =>
    axios.get<ApiResponse<any>>(`${API_BASE}/reports/${id}`).then((r: any) => r.data.data),

  create: (dto: CreateReportDto) =>
    axios.post<ApiResponse<any>>(`${API_BASE}/reports`, dto).then((r: any) => r.data.data),

  update: (id: string, dto: Partial<CreateReportDto>) =>
    axios.put<ApiResponse<any>>(`${API_BASE}/reports/${id}`, dto).then((r: any) => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/reports/${id}`).then((r: any) => r.data.data),
};

export default reportService;
