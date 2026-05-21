import axios from 'axios';
import { API_BASE } from '../config';
import type { ApiResponse } from '@med/shared-types';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    username: string;
    realName: string;
    role: string;
    phone?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  realName: string;
  role: string;
  phone?: string;
  permissions?: string[];
}

const TOKEN_KEY = 'med_logistics_token';
const USER_KEY = 'med_logistics_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loginApi(dto: LoginDto): Promise<LoginResult> {
  const res = await axios.post<ApiResponse<LoginResult>>(`${API_BASE}/auth/login`, dto);
  return res.data.data;
}

export async function getProfileApi(): Promise<UserProfile> {
  const res = await axios.get<ApiResponse<UserProfile>>(`${API_BASE}/auth/profile`);
  return res.data.data;
}

export function setupAxiosInterceptors() {
  axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
}
