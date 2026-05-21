import axios from 'axios';
import { API_BASE } from '../config';
import type { Customer, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface CustomerQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  type?: string;
  enabled?: boolean;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const customerService = {
  getList: (params: CustomerQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Customer>>>(`${API_BASE}/customers`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Customer>>(`${API_BASE}/customers/${id}`).then(r => r.data.data),

  create: (dto: Partial<Customer>) =>
    axios.post<ApiResponse<Customer>>(`${API_BASE}/customers`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<Customer>) =>
    axios.put<ApiResponse<Customer>>(`${API_BASE}/customers/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/customers/${id}`).then(r => r.data.data),

  search: (keyword: string) =>
    axios.get<ApiResponse<Customer[]>>(`${API_BASE}/customers/search`, { params: { keyword } }).then(r => r.data.data),
};

export default customerService;
