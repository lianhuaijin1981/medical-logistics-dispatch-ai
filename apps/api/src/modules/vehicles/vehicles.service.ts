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
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
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
