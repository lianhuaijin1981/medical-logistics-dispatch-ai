import axios from 'axios';
import { API_BASE } from '../config';
import type { GPSTrack, ApiResponse } from '@med/shared-types';

export interface TrackingQuery extends Record<string, unknown> {
  vehicleId?: string;
  dispatchId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

const trackingService = {
  getLatest: (vehicleId: string) =>
    axios.get<ApiResponse<GPSTrack>>(`${API_BASE}/tracking/latest/${vehicleId}`).then(r => r.data.data),

  getByDispatch: (dispatchId: string, params?: { startTime?: string; endTime?: string }) =>
    axios.get<ApiResponse<GPSTrack[]>>(`${API_BASE}/tracking/dispatch/${dispatchId}`, { params }).then(r => r.data.data),

  getByTimeRange: (vehicleId: string, startTime: string, endTime: string) =>
    axios.get<ApiResponse<GPSTrack[]>>(`${API_BASE}/tracking/vehicle/${vehicleId}`, {
      params: { startTime, endTime },
    }).then(r => r.data.data),

  getActiveVehicles: () =>
    axios.get<ApiResponse<string[]>>(`${API_BASE}/tracking/active-vehicles`).then(r => r.data.data),
};

export default trackingService;
