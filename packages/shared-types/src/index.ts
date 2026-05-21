// ============================================================
// @med/shared-types — 医药物流调度系统核心类型定义
// ============================================================

// ==================== 枚举 ====================

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PICKING = 'picking',
  PICKED = 'picked',
  DISPATCHING = 'dispatching',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception',
}

export enum OrderPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum WarehouseType {
  CENTRAL = 'central',
  REGIONAL = 'regional',
  TRANSIT = 'transit',
  COLD_CHAIN = 'cold_chain',
}

export enum VehicleType {
  TRUCK_SMALL = 'truck_small',
  TRUCK_MEDIUM = 'truck_medium',
  TRUCK_LARGE = 'truck_large',
  REFRIGERATED = 'refrigerated',
  DANGEROUS_GOODS = 'dangerous_goods',
}

export enum VehicleStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  MAINTENANCE = 'maintenance',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  ON_ROUTE = 'on_route',
  RESTING = 'resting',
  OFF_DUTY = 'off_duty',
}

export enum DispatchStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  LOADING = 'loading',
  DEPARTED = 'departed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PickingMethod {
  WAVE = 'wave',
  BATCH = 'batch',
  ZONE = 'zone',
  PIECE = 'piece',
}

export enum PickingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXCEPTION = 'exception',
}

export enum InventoryClass {
  A = 'A', // 高价值/高周转
  B = 'B', // 中等
  C = 'C', // 低价值/低周转
}

export enum TemperatureZone {
  AMBIENT = 'ambient',   // 常温
  COOL = 'cool',         // 阴凉 ≤20°C
  COLD = 'cold',         // 冷藏 2~8°C
  FROZEN = 'frozen',     // 冷冻 ≤-18°C
}

export enum AlertLevel {
  INFO = 'info',
  WARN = 'warn',
  CRITICAL = 'critical',
}

export enum ReportType {
  DISPATCH_SUMMARY = 'dispatch_summary',
  INVENTORY_TURNOVER = 'inventory_turnover',
  VEHICLE_UTILIZATION = 'vehicle_utilization',
  DRIVER_PERFORMANCE = 'driver_performance',
  COLD_CHAIN_COMPLIANCE = 'cold_chain_compliance',
  COST_ANALYSIS = 'cost_analysis',
}

// ==================== 基础接口 ====================

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  province: string;
  city: string;
  district: string;
  detail: string;
  geo?: GeoPoint;
  contactName: string;
  contactPhone: string;
}

export interface TimeWindow {
  start: string; // ISO datetime
  end: string;   // ISO datetime
}

export interface TimeRange {
  from: string;
  to: string;
}

// ==================== 核心实体 ====================

export interface User {
  _id: string;
  username: string;
  realName: string;
  role: UserRole;
  phone: string;
  warehouseId?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'driver' | 'viewer';

export interface Customer {
  _id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic' | 'distributor' | 'other';
  address: Address;
  contacts: { name: string; phone: string; role: string }[];
  creditLevel: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  type: WarehouseType;
  address: Address;
  capacity: number;
  temperatureZones: TemperatureZone[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  category: string;
  specification: string;
  manufacturer: string;
  approvalNumber: string; // 国药准字
  batchNo: string;
  expiryDate: string;
  temperatureZone: TemperatureZone;
  quantity: number;
  lockedQuantity: number;
  warehouseId: string;
  location: string;      // 货位编码
  inventoryClass: InventoryClass;
  unit: string;
  unitPrice: number;
  safetyStock: number;
  maxStock: number;
  minStock: number;
  abcClass: InventoryClass;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  capacity: {
    weight: number;     // kg
    volume: number;     // m³
    pallets: number;
  };
  temperatureZones: TemperatureZone[];
  equipment: {
    hasGPS: boolean;
    hasThermometer: boolean;
    hasCamera: boolean;
    hasLock: boolean;
  };
  lastMaintenanceAt: string;
  nextMaintenanceAt: string;
  currentLocation?: GeoPoint;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  realName: string;
  phone: string;
  licenseNumber: string;
  licenseType: string;
  status: DriverStatus;
  rating: number;
  totalOrders: number;
  currentVehicleId?: string;
  workStartTime: string;
  workEndTime: string;
  maxWorkHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNo: string;
  customerId: string;
  warehouseId: string;
  items: OrderItem[];
  priority: OrderPriority;
  status: OrderStatus;
  requestedDeliveryWindow: TimeWindow;
  actualDeliveryTime?: string;
  totalWeight: number;
  totalVolume: number;
  totalAmount: number;
  temperatureRequirements: TemperatureZone[];
  specialInstructions?: string;
  dispatchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sku: string;
  inventoryId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface PickingTask {
  _id: string;
  taskNo: string;
  warehouseId: string;
  method: PickingMethod;
  status: PickingStatus;
  orderIds: string[];
  items: PickingItem[];
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  zone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickingItem {
  sku: string;
  name: string;
  orderNo: string;
  location: string;
  pickQuantity: number;
  actualQuantity?: number;
  batchNo: string;
  expiryDate: string;
}

export interface DispatchTask {
  _id: string;
  taskNo: string;
  vehicleId: string;
  driverId: string;
  warehouseId: string;
  orderIds: string[];
  status: DispatchStatus;
  route?: RoutePlan;
  totalWeight: number;
  totalVolume: number;
  orderCount: number;
  estimatedDistance: number;
  estimatedDuration: number;
  departureTime?: string;
  arrivalTime?: string;
  actualDistance?: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePlan {
  _id: string;
  dispatchId: string;
  stops: RouteStop[];
  totalDistance: number;   // meters
  totalDuration: number;   // seconds
  geometry: GeoPoint[];    // route line
  algorithm: RouteAlgorithm;
  trafficConsidered: boolean;
  createdAt: string;
}

export interface RouteStop {
  sequence: number;
  orderId: string;
  type: 'pickup' | 'delivery';
  address: Address;
  estimatedArrival: string;
  estimatedDeparture: string;
  serviceTime: number;     // seconds
  distanceFromPrev: number;
}

export type RouteAlgorithm = 'dijkstra' | 'astar' | 'ga_vrp' | 'tabu_search' | 'nearest_neighbor';

export interface GPSTrack {
  _id: string;
  vehicleId: string;
  dispatchId: string;
  timestamp: string;
  location: GeoPoint;
  speed: number;           // km/h
  heading: number;         // degrees
  accuracy: number;
}

export interface ColdChainRecord {
  _id: string;
  dispatchId: string;
  vehicleId: string;
  orderId: string;
  timestamp: string;
  temperature: number;
  humidity?: number;
  zone: TemperatureZone;
  withinRange: boolean;
  alertGenerated: boolean;
  rangeLimit?: { min: number; max: number; unit: string };
}

export interface Alert {
  _id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  relatedEntity: {
    type: string;
    id: string;
  };
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export type AlertType =
  | 'temperature_excursion'
  | 'route_deviation'
  | 'delay'
  | 'vehicle_breakdown'
  | 'stock_out'
  | 'expiry_warning'
  | 'gps_offline';

// ==================== API 请求/响应 ====================

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
  startDate: string;
  endDate: string;
}

// ==================== WebSocket 事件 ====================

export interface WsVehiclePosition {
  vehicleId: string;
  plateNumber: string;
  location: GeoPoint;
  speed: number;
  heading: number;
  dispatchId?: string;
  timestamp: string;
}

export interface WsTemperatureUpdate {
  dispatchId: string;
  vehicleId: string;
  orderId: string;
  temperature: number;
  zone: TemperatureZone;
  withinRange: boolean;
  timestamp: string;
}

export interface WsAlertEvent {
  alertId: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
}
