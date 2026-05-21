import axios from 'axios';
import { API_BASE } from '../config';
import type { Vehicle, VehicleType, VehicleStatus, ApiResponse, PaginatedResponse } from '@med/shared-types';

export interface CreateVehicleDto {
  plateNumber: string;
  brand: string;
  vehicleModel: string;
  year?: number;
  type: VehicleType;
  capacity: number;
  maxWeight: number;
  temperatureZones?: string[];
  enabled?: boolean;
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>;

const vehicleService = {
  getList: (params: Record<string, any> = {}) =>
    axios.get<ApiResponse<PaginatedResponse<Vehicle>>>(`${API_BASE}/vehicles`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}`).then(r => r.data.data),

  create: (dto: CreateVehicleDto) =>
    axios.post<ApiResponse<Vehicle>>(`${API_BASE}/vehicles`, dto).then(r => r.data.data),

  update: (id: string, dto: UpdateVehicleDto) =>
    axios.put<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}`, dto).then(r => r.data.data),

  remove: (id: string) =>
    axios.delete<ApiResponse<void>>(`${API_BASE}/vehicles/${id}`).then(r => r.data.data),

  getAvailable: () =>
    axios.get<ApiResponse<Vehicle[]>>(`${API_BASE}/vehicles/available`).then(r => r.data.data),

  updateStatus: (id: string, status: VehicleStatus) =>
    axios.patch<ApiResponse<Vehicle>>(`${API_BASE}/vehicles/${id}/status`, { status }).then(r => r.data.data),
};

export default vehicleService;
