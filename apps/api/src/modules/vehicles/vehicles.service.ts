import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument, VehicleType, VehicleStatus } from './vehicle.schema';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockVehicles = [
        { _id:'v1', plateNumber:'京A·M1234', type:'van', status:'available', brand:'福田',
          capacity:800, temperatureZones:['ambient','cool'], driverId:'d1',
          lastMaintenance: new Date('2026-01-15'), mileage:45000, enabled:true, createdAt:new Date() },
        { _id:'v2', plateNumber:'沪B·X5678', type:'truck', status:'on_trip', brand:'解放',
          capacity:2000, temperatureZones:['cold','frozen'], driverId:'d2',
          lastMaintenance: new Date('2025-11-20'), mileage:78000, enabled:true, createdAt:new Date() },
        { _id:'v3', plateNumber:'粤C·W9012', type:'refrigerated', status:'maintenance', brand:'东风',
          capacity:1500, temperatureZones:['cold','frozen'], driverId:null,
          lastMaintenance: new Date(), mileage:62000, enabled:true, createdAt:new Date() },
        { _id:'v4', plateNumber:'川D·L3456', type:'van', status:'available', brand:'福田',
          capacity:800, temperatureZones:['ambient'], driverId:null,
          lastMaintenance: new Date('2026-03-01'), mileage:23000, enabled:true, createdAt:new Date() },
        { _id:'v5', plateNumber:'京E·R7890', type:'truck', status:'offline', brand:'解放',
          capacity:3000, temperatureZones:['ambient','cool','cold'], driverId:null,
          lastMaintenance: new Date('2025-08-10'), mileage:120000, enabled:false, createdAt:new Date() },
      ];
      const { status, type, enabled, keyword } = query;
      let filtered = mockVehicles;
      if (status) filtered = filtered.filter(v => v.status === status);
      if (type) filtered = filtered.filter(v => v.type === type);
      if (enabled !== undefined) filtered = filtered.filter(v => v.enabled === (enabled === 'true' || enabled === true));
      if (keyword) filtered = filtered.filter(v => v.plateNumber.includes(keyword) || v.brand?.includes(keyword));
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, status, type, enabled, keyword } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (enabled !== undefined) filter.enabled = enabled === 'true' || enabled === true;
    if (keyword) {
      filter.$or = [
        { plateNumber: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.vehicleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .exec(),
      this.vehicleModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) throw new NotFoundException(`车辆 ${id} 未找到`);
    return vehicle;
  }

  async findByPlateNumber(plateNumber: string) {
    return this.vehicleModel.findOne({ plateNumber }).exec();
  }

  async findAvailable(type?: string) {
    const filter: any = { status: VehicleStatus.AVAILABLE, enabled: true };
    if (type) filter.type = type;
    return this.vehicleModel.find(filter).sort({ capacity: -1 }).exec();
  }

  async create(dto: any) {
    const vehicle = new this.vehicleModel(dto);
    return vehicle.save();
  }

  async update(id: string, dto: any) {
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!vehicle) throw new NotFoundException(`车辆 ${id} 未找到`);
    return vehicle;
  }

  async updateStatus(id: string, status: VehicleStatus) {
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!vehicle) throw new NotFoundException(`车辆 ${id} 未找到`);
    return vehicle;
  }

  async remove(id: string) {
    const result = await this.vehicleModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`车辆 ${id} 未找到`);
    return { id, deleted: true };
  }
}
