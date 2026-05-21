import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './inventory.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name) private inventoryModel: Model<InventoryItemDocument>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, sku, name, category, warehouseId, abcClass, temperatureZone } = query;
    const filter: any = {};
    if (sku) filter.sku = sku;
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (category) filter.category = category;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (abcClass) filter.abcClass = abcClass;
    if (temperatureZone) filter.temperatureZone = temperatureZone;

    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const item = await this.inventoryModel
      .findById(id)
      .populate('warehouseId')
      .exec();
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async create(dto: any) {
    const existing = await this.inventoryModel.findOne({
      sku: dto.sku,
      batchNo: dto.batchNo,
      warehouseId: dto.warehouseId,
    }).exec();
    if (existing) {
      throw new ConflictException(
        `Inventory item with SKU ${dto.sku}, batch ${dto.batchNo} already exists in warehouse ${dto.warehouseId}`,
      );
    }
    const item = new this.inventoryModel(dto);
    return item.save();
  }

  async update(id: string, dto: any) {
    const item = await this.inventoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async remove(id: string) {
    const result = await this.inventoryModel.deleteOne({ _id: id }).exec();
    return { id, deleted: result.deletedCount > 0 };
  }

  async findLowStock(query?: any) {
    const { page = 1, pageSize = 20, warehouseId } = query || {};
    const filter: any = {
      $expr: { $lte: ['$quantity', '$safetyStock'] },
    };
    if (warehouseId) filter.warehouseId = warehouseId;

    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort({ quantity: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findExpiring(days = 30, query?: any) {
    const { page = 1, pageSize = 20, warehouseId } = query || {};
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const filter: any = {
      expiryDate: { $gte: now, $lte: threshold },
    };
    if (warehouseId) filter.warehouseId = warehouseId;

    const [data, total] = await Promise.all([
      this.inventoryModel
        .find(filter)
        .sort({ expiryDate: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.inventoryModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }
}
