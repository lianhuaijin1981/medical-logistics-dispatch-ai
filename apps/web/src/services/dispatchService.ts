import axios from 'axios';
import { API_BASE } from '../config';
import type { DispatchTask, DispatchStatus, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface DispatchQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  status?: DispatchStatus;
  vehicleId?: string;
  driverId?: string;
  warehouseId?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDispatchDto {
  vehicleId: string;
  driverId?: string;
  warehouseId: string;
  orderIds: string[];
  priority?: 'normal' | 'urgent' | 'critical';
  temperatureZones?: string[];
  notes?: string;
}

const dispatchService = {
  getList: (params: DispatchQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<DispatchTask>>>(`${API_BASE}/dispatch`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<DispatchTask>>(`${API_BASE}/dispatch/${id}`).then(r => r.data.data),

  create: (dto: CreateDispatchDto) =>
    axios.post<ApiResponse<DispatchTask>>(`${API_BASE}/dispatch`, dto).then(r => r.data.data),

  update: (id: string, dto: Partial<CreateDispatchDto>) =>
    axios.put<ApiResponse<DispatchTask>>(`${API_BASE}/dispatch/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/dispatch/${id}`).then(r => r.data.data),

  updateStatus: (id: string, status: DispatchStatus, remark?: string) =>
    axios.patch<ApiResponse<DispatchTask>>(`${API_BASE}/dispatch/${id}/status`, { status, remark }).then(r => r.data.data),

  getByVehicle: (vehicleId: string) =>
    axios.get<ApiResponse<DispatchTask[]>>(`${API_BASE}/dispatch/vehicle/${vehicleId}`).then(r => r.data.data),

  getByDriver: (driverId: string) =>
    axios.get<ApiResponse<DispatchTask[]>>(`${API_BASE}/dispatch/driver/${driverId}`).then(r => r.data.data),
};

export default dispatchService;
