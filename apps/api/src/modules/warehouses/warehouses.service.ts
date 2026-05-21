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
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockWarehouses = [
        { _id:'w1', name:'北京中央仓', code:'WH-0001', type:'central',
          address:{ city:'北京', district:'大兴区' }, capacity:50000,
          temperatureZones:['ambient','cool','cold'], enabled:true, createdAt:new Date() },
        { _id:'w2', name:'上海区域仓', code:'WH-0002', type:'regional',
          address:{ city:'上海', district:'浦东新区' }, capacity:30000,
          temperatureZones:['ambient','cold'], enabled:true, createdAt:new Date() },
        { _id:'w3', name:'广州冷链仓', code:'WH-0003', type:'cold_chain',
          address:{ city:'广州', district:'白云区' }, capacity:20000,
          temperatureZones:['cold','frozen'], enabled:true, createdAt:new Date() },
        { _id:'w4', name:'成都中转仓', code:'WH-0004', type:'transit',
          address:{ city:'成都', district:'双流区' }, capacity:15000,
          temperatureZones:['ambient'], enabled:false, createdAt:new Date() },
      ];
      const { type, enabled } = query;
      let filtered = mockWarehouses;
      if (type) filtered = filtered.filter(w => w.type === type);
      if (enabled !== undefined) filtered = filtered.filter(w => w.enabled === (enabled === 'true'));
      return { items: filtered, total: filtered.length, page: Number(query.page) || 1, pageSize: Number(query.pageSize) || 20 };
    }

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
    return { items: data, total, page: Number(page), pageSize: Number(pageSize) };
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
