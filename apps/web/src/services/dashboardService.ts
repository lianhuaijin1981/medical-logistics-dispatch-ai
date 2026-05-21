import axios from 'axios';
import { API_BASE } from '../config';

export interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayCount: number;
  };
  inventory: {
    totalItems: number;
    lowStock: number;
    expiringItems: number;
    byCategory: { category: string; count: number }[];
  };
  vehicles: {
    total: number;
    available: number;
    onTrip: number;
    maintenance: number;
    offline: number;
  };
  drivers: {
    total: number;
    available: number;
    onTrip: number;
    offDuty: number;
  };
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    unresolved: number;
  };
  recentOrders: {
    _id: string;
    orderNo: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customerId: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axios.get(`${API_BASE}/dashboard/stats`);
  return data;
}
