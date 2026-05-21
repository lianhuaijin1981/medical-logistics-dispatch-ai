import axios from 'axios';
import { API_BASE } from '../config';
import type { Driver, DriverStatus, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface DriverQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  status?: DriverStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const driverService = {
  getList: (params: DriverQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Driver>>>(`${API_BASE}/drivers`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Driver>>(`${API_BASE}/drivers/${id}`).then(r => r.data.data),

  create: (dto: Partial<Driver>) =>
    axios.post<ApiResponse<Driver>>(`${API_BASE}/drivers`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<Driver>) =>
    axios.put<ApiResponse<Driver>>(`${API_BASE}/drivers/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/drivers/${id}`).then(r => r.data.data),

  getAvailable: () =>
    axios.get<ApiResponse<Driver[]>>(`${API_BASE}/drivers/available`).then(r => r.data.data),

  updateStatus: (id: string, status: DriverStatus, vehicleId?: string) =>
    axios.patch<ApiResponse<Driver>>(`${API_BASE}/drivers/${id}/status`, { status, vehicleId }).then(r => r.data.data),
};

export default driverService;
