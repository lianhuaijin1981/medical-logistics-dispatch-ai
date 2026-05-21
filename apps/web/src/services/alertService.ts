import axios from 'axios';
import { API_BASE } from '../config';
import type { AlertLevel, AlertType, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface AlertQuery extends Record<string, unknown> {
  page?: number;
  pageSize?: number;
  level?: AlertLevel;
  type?: AlertType;
  resolved?: boolean;
  relatedOrderId?: string;
  relatedVehicleId?: string;
  relatedDriverId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AlertDto {
  level?: AlertLevel;
  type?: AlertType;
  message?: string;
  relatedOrderId?: string;
  relatedVehicleId?: string;
  relatedDriverId?: string;
}

export interface ResolveAlertDto {
  note?: string;
  resolvedBy?: string;
}

const alertService = {
  getList: (params: AlertQuery = {}) =>
    axios.get<ApiResponse<PaginatedResponse<any>>>(`${API_BASE}/alerts`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<any>>(`${API_BASE}/alerts/${id}`).then(r => r.data.data),

  getUnresolved: (params: Record<string, any> = {}) =>
    axios.get<ApiResponse<any[]>>(`${API_BASE}/alerts`, { params: { ...params, resolved: 'false' } }).then(r => r.data.data),

  create: (dto: AlertDto) =>
    axios.post<ApiResponse<any>>(`${API_BASE}/alerts`, dto).then(r => r.data.data),

  resolve: (id: string, dto: ResolveAlertDto = {}) =>
    axios.patch<ApiResponse<any>>(`${API_BASE}/alerts/${id}/resolve`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/alerts/${id}`).then(r => r.data.data),
};

export default alertService;
