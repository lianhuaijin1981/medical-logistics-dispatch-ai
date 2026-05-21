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
    const { page = 1, pageSize = 20, status, enabled, keyword } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (enabled !== undefined) filter.enabled = enabled === 'true' || enabled === true;
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
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
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
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
