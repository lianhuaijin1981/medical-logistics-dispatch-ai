import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Warehouse } from './warehouse.schema';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, type, enabled, code } = query;
    const filter: any = {};
    if (type) filter.type = type;
    if (enabled !== undefined) filter.enabled = enabled === 'true';
    if (code) filter.code = { $regex: code, $options: 'i' };

    const [data, total] = await Promise.all([
      this.warehouseModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.warehouseModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseModel.findById(id).exec();
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  async create(dto: any) {
    if (!dto.code) {
      const count = await this.warehouseModel.countDocuments().exec();
      dto.code = `WH-${String(count + 1).padStart(4, '0')}`;
    }
    const warehouse = new this.warehouseModel(dto);
    return warehouse.save();
  }

  async update(id: string, dto: any) {
    const warehouse = await this.warehouseModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  async remove(id: string) {
    const result = await this.warehouseModel.deleteOne({ _id: id }).exec();
    return { id, deleted: result.deletedCount > 0 };
  }

  async findByType(type: string) {
    return this.warehouseModel
      .find({ type, enabled: true })
      .select('code name type enabled')
      .sort({ createdAt: -1 })
      .exec();
  }
}
