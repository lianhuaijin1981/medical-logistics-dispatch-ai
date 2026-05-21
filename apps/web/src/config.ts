export const API_BASE = '/api';
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

// API endpoints
export const ENDPOINTS = {
  AUTH: { LOGIN: `${API_BASE}/auth/login`, LOGOUT: `${API_BASE}/auth/logout`, PROFILE: `${API_BASE}/auth/profile` },
  ORDERS: `${API_BASE}/orders`,
  WAREHOUSES: `${API_BASE}/warehouses`,
  INVENTORY: `${API_BASE}/inventory`,
  VEHICLES: `${API_BASE}/vehicles`,
  DRIVERS: `${API_BASE}/drivers`,
  DISPATCH: `${API_BASE}/dispatch`,
  ROUTES: `${API_BASE}/routes`,
  TRACKING: `${API_BASE}/tracking`,
  CUSTOMERS: `${API_BASE}/customers`,
  COLD_CHAIN: `${API_BASE}/cold-chain`,
  ALERTS: `${API_BASE}/alerts`,
  REPORTS: `${API_BASE}/reports`,
  ANALYTICS: `${API_BASE}/analytics`,
} as const;
