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
    // DEV MODE: return realistic mock data so frontend pages have content
    if (process.env.NODE_ENV === 'development') {
      return {
        orders: { total: 128, pending: 12, processing: 8, shipped: 15, delivered: 89, cancelled: 4, todayCount: 7 },
        inventory: { totalItems: 15234, lowStock: 23, expiringItems: 8, byCategory: [
          { category: '药品', count: 8234 }, { category: '医疗器械', count: 4200 },
          { category: '试剂', count: 2100 }, { category: '耗材', count: 700 },
        ]},
        vehicles: { total: 18, available: 8, onTrip: 7, maintenance: 2, offline: 1 },
        drivers: { total: 22, available: 10, onTrip: 8, offDuty: 4 },
        alerts: { total: 9, critical: 1, warning: 3, info: 5, unresolved: 4 },
        recentOrders: [
          { _id:'1', orderNo:'YX20250601001', customerId:'c1', warehouseId:'w1', status:'pending',
            items:[{sku:'SKU001',name:'阿司匹林',quantity:2,unit:'盒',unitPrice:15.50}],
            totalAmount:31, priority:'normal', temperatureRequirements:['room'],
            createdAt: new Date(), updatedAt: new Date() } as any,
          { _id:'2', orderNo:'YX20250601002', customerId:'c2', warehouseId:'w1', status:'processing',
            items:[{sku:'SKU002',name:'生理盐水',quantity:10,unit:'瓶',unitPrice:3.80}],
            totalAmount:38, priority:'urgent', temperatureRequirements:['cold'],
            createdAt: new Date(Date.now()-3600000), updatedAt: new Date() } as any,
        ],
      };
    }

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
