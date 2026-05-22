import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument, DriverStatus } from './driver.schema';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockDrivers = [
        { _id:'d1', realName:'张伟', phone:'13800138011', licenseNumber:'E12345', licenseType:'B2',
          status:'available', certifications:['危化品运输','冷链资质'], enabled:true, createdAt:new Date() },
        { _id:'d2', realName:'李强', phone:'13800138012', licenseNumber:'E23456', licenseType:'A2',
          status:'on_trip', certifications:['冷链资质'], enabled:true, createdAt:new Date() },
        { _id:'d3', realName:'王芳', phone:'13800138013', licenseNumber:'E34567', licenseType:'C1',
          status:'available', certifications:[], enabled:true, createdAt:new Date() },
        { _id:'d4', realName:'刘洋', phone:'13800138014', licenseNumber:'E45678', licenseType:'B2',
          status:'off_duty', certifications:['危化品运输'], enabled:true, createdAt:new Date() },
        { _id:'d5', realName:'陈明', phone:'13800138015', licenseNumber:'E56789', licenseType:'A1',
          status:'inactive', certifications:[], enabled:false, createdAt:new Date() },
      ];
      const { status, enabled, keyword } = query;
      let filtered = mockDrivers;
      if (status) filtered = filtered.filter(d => d.status === status);
      if (enabled !== undefined) filtered = filtered.filter(d => d.enabled === (enabled === 'true' || enabled === true));
      if (keyword) filtered = filtered.filter(d => d.realName.includes(keyword) || d.phone.includes(keyword) || d.licenseNumber.includes(keyword));
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, status, enabled, keyword } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (enabled !== undefined) filter.enabled = enabled === 'true' || enabled === true;
    if (keyword) {
      filter.$or = [
        { realName: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { licenseNumber: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.driverModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .exec(),
      this.driverModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const driver = await this.driverModel.findById(id).exec();
    if (!driver) throw new NotFoundException(`司机 ${id} 未找到`);
    return driver;
  }

  async findAvailable() {
    return this.driverModel
      .find({ status: DriverStatus.AVAILABLE, enabled: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(dto: any) {
    const driver = new this.driverModel(dto);
    return driver.save();
  }

  async update(id: string, dto: any) {
    const driver = await this.driverModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!driver) throw new NotFoundException(`司机 ${id} 未找到`);
    return driver;
  }

  async updateStatus(id: string, status: DriverStatus, vehicleId?: string) {
    const update: any = { status };
    if (vehicleId !== undefined) update.currentVehicleId = vehicleId;
    const driver = await this.driverModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!driver) throw new NotFoundException(`司机 ${id} 未找到`);
    return driver;
  }

  async remove(id: string) {
    const result = await this.driverModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`司机 ${id} 未找到`);
    return { id, deleted: true };
  }
}
