import axios from 'axios';
import { API_BASE } from '../config';
import type { ColdChainRecord, TemperatureZone, ApiResponse } from '@med/shared-types';

export interface ColdChainQuery extends Record<string, unknown> {
  dispatchId?: string;
  vehicleId?: string;
  zone?: TemperatureZone;
  withinRange?: boolean;
  alertStatus?: string;
  startTime?: string;
  endTime?: string;
}

const coldChainService = {
  getList: (params: ColdChainQuery = {}) =>
    axios.get<ApiResponse<ColdChainRecord[]>>(`${API_BASE}/cold-chain`, { params }).then(r => r.data.data),

  getById: (id: string) =>
    axios.get<ApiResponse<ColdChainRecord>>(`${API_BASE}/cold-chain/${id}`).then(r => r.data.data),

  getBreaches: (params?: { startTime?: string; endTime?: string }) =>
    axios.get<ApiResponse<ColdChainRecord[]>>(`${API_BASE}/cold-chain/breaches`, { params }).then(r => r.data.data),

  getByDispatch: (dispatchId: string, params?: { startTime?: string; endTime?: string }) =>
    axios.get<ApiResponse<ColdChainRecord[]>>(`${API_BASE}/cold-chain/dispatch/${dispatchId}`, { params }).then(r => r.data.data),

  getStats: (params?: { dispatchId?: string; startTime?: string; endTime?: string }) =>
    axios.get<ApiResponse<Record<string, number>>>(`${API_BASE}/cold-chain/stats`, { params }).then(r => r.data.data),
};

export default coldChainService;
