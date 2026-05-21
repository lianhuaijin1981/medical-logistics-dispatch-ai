import axios from 'axios';
import { API_BASE } from '../config';
import type { Vehicle, VehicleType, VehicleStatus, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface VehicleQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  type?: VehicleType;
  status?: VehicleStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const vehicleService = {
  getList: (params: VehicleQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Vehicle>>>(`${API_BASE}/vehicles`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}`).then(r => r.data.data),

  create: (dto: Partial<Vehicle>) =>
    axios.post<ApiResponse<Vehicle>>(`${API_BASE}/vehicles`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<Vehicle>) =>
    axios.put<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/vehicles/${id}`).then(r => r.data.data),

  getAvailable: () =>
    axios.get<ApiResponse<Vehicle[]>>(`${API_BASE}/vehicles/available`).then(r => r.data.data),

  updateStatus: (id: string, status: VehicleStatus) =>
    axios.patch<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}/status`, { status }).then(r => r.data.data),
};

export default vehicleService;
