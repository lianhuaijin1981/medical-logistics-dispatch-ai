import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { InventoryItem, InventoryItemDocument } from '../inventory/inventory.schema';
import { Vehicle, VehicleDocument, VehicleStatus } from '../vehicles/vehicle.schema';
import { Driver, DriverDocument, DriverStatus } from '../drivers/driver.schema';
import { Alert, AlertDocument, AlertLevel } from '../alerts/alert.schema';

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
  recentOrders: Order[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel('Alert') private alertModel: Model<AlertDocument>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      orderStats,
      inventoryStats,
      vehicleStats,
      driverStats,
      alertStats,
      recentOrders,
    ] = await Promise.all([
      this.getOrderStats(todayStart),
      this.getInventoryStats(),
      this.getVehicleStats(),
      this.getDriverStats(),
      this.getAlertStats(),
      this.orderModel.find().sort({ createdAt: -1 }).limit(5).exec(),
    ]);

    return {
      orders: orderStats,
      inventory: inventoryStats,
      vehicles: vehicleStats,
      drivers: driverStats,
      alerts: alertStats,
      recentOrders,
    };
  }

  private async getOrderStats(todayStart: Date) {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      todayCount,
    ] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.IN_TRANSIT }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }).exec(),
      this.orderModel.countDocuments({ createdAt: { $gte: todayStart } }).exec(),
    ]);

    return { total, pending, processing, shipped, delivered, cancelled, todayCount };
  }

  private async getInventoryStats() {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalItems, lowStock, expiringItems, byCategory] = await Promise.all([
      this.inventoryModel.countDocuments().exec(),
      this.inventoryModel.countDocuments({ $expr: { $lte: ['$quantity', '$safetyStock'] } }).exec(),
      this.inventoryModel.countDocuments({ expiryDate: { $lte: thirtyDaysLater, $gte: today } }).exec(),
      this.inventoryModel.aggregate([
        { $group: { _id: '$category', count: { $sum: '$quantity' } } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
        { $limit: 10 },
      ]).exec(),
    ]);

    return { totalItems, lowStock, expiringItems, byCategory };
  }

  private async getVehicleStats() {
    const [total, available, onTrip, maintenance, offline] = await Promise.all([
      this.vehicleModel.countDocuments().exec(),
      this.vehicleModel.countDocuments({ status: VehicleStatus.AVAILABLE }).exec(),
      this.vehicleModel.countDocuments({ status: VehicleStatus.ON_TRIP }).exec(),
      this.vehicleModel.countDocuments({ status: VehicleStatus.MAINTENANCE }).exec(),
      this.vehicleModel.countDocuments({ status: VehicleStatus.OFFLINE }).exec(),
    ]);

    return { total, available, onTrip, maintenance, offline };
  }

  private async getDriverStats() {
    const [total, available, onTrip, offDuty] = await Promise.all([
      this.driverModel.countDocuments().exec(),
      this.driverModel.countDocuments({ status: DriverStatus.AVAILABLE }).exec(),
      this.driverModel.countDocuments({ status: DriverStatus.ON_TRIP }).exec(),
      this.driverModel.countDocuments({ status: DriverStatus.OFF_DUTY }).exec(),
    ]);

    return { total, available, onTrip, offDuty };
  }

  private async getAlertStats() {
    const [total, critical, warning, info, unresolved] = await Promise.all([
      this.alertModel.countDocuments().exec(),
      this.alertModel.countDocuments({ level: AlertLevel.CRITICAL }).exec(),
      this.alertModel.countDocuments({ level: AlertLevel.WARNING }).exec(),
      this.alertModel.countDocuments({ level: AlertLevel.INFO }).exec(),
      this.alertModel.countDocuments({ resolved: false }).exec(),
    ]);

    return { total, critical, warning, info, unresolved };
  }
}
