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
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockInventory = [
        { _id:'i1', sku:'SKU001', name:'阿司匹林', category:'药品', batchNo:'B20250601',
          expiryDate:new Date('2026-12-31'), temperatureZone:'ambient',
          quantity:500, lockedQuantity:20, warehouseId:'w1', location:'A-01-03',
          abcClass:'A', unit:'盒', unitPrice:15.50, safetyStock:50, createdAt:new Date() },
        { _id:'i2', sku:'SKU002', name:'生理盐水', category:'药品', batchNo:'B20250520',
          expiryDate:new Date('2027-03-15'), temperatureZone:'cold',
          quantity:200, lockedQuantity:0, warehouseId:'w1', location:'C-02-01',
          abcClass:'B', unit:'瓶', unitPrice:3.80, safetyStock:100, createdAt:new Date() },
        { _id:'i3', sku:'SKU003', name:'医用外科口罩', category:'耗材', batchNo:'B20250110',
          expiryDate:new Date('2028-01-01'), temperatureZone:'ambient',
          quantity:30, lockedQuantity:0, warehouseId:'w2', location:'B-05-12',
          abcClass:'C', unit:'只', unitPrice:0.85, safetyStock:500, createdAt:new Date() },
        { _id:'i4', sku:'SKU004', name:'胰岛素注射液', category:'药品', batchNo:'B20250610',
          expiryDate:new Date('2026-08-20'), temperatureZone:'cold',
          quantity:80, lockedQuantity:10, warehouseId:'w3', location:'D-01-06',
          abcClass:'A', unit:'支', unitPrice:45.00, safetyStock:30, createdAt:new Date() },
        { _id:'i5', sku:'SKU005', name:'核酸检测试剂盒', category:'试剂', batchNo:'B20250501',
          expiryDate:new Date('2026-06-30'), temperatureZone:'frozen',
          quantity:15, lockedQuantity:0, warehouseId:'w3', location:'F-03-02',
          abcClass:'B', unit:'盒', unitPrice:128.00, safetyStock:20, createdAt:new Date() },
      ];
      const { category, warehouseId, abcClass, temperatureZone, lowStock, expiring } = query;
      let filtered = mockInventory;
      if (category) filtered = filtered.filter(i => i.category === category);
      if (warehouseId) filtered = filtered.filter(i => i.warehouseId === warehouseId);
      if (abcClass) filtered = filtered.filter(i => i.abcClass === abcClass);
      if (temperatureZone) filtered = filtered.filter(i => i.temperatureZone === temperatureZone);
      if (lowStock === 'true') filtered = filtered.filter(i => i.quantity <= i.safetyStock);
      if (expiring === 'true') { const d30 = new Date(Date.now()+30*86400000); filtered = filtered.filter(i => new Date(i.expiryDate) <= d30); }
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

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
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
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
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
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
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }
}
