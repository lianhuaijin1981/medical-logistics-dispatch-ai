import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockCustomers = [
        { _id:'c1', name:'北京协和医院', type:'hospital', contactName:'张主任',
          contactPhone:'13800138001', address:{ city:'北京', district:'东城区' },
          enabled:true, createdAt:new Date() },
        { _id:'c2', name:'上海瑞金医院', type:'hospital', contactName:'李主任',
          contactPhone:'13800138002', address:{ city:'上海', district:'黄浦区' },
          enabled:true, createdAt:new Date() },
        { _id:'c3', name:'国药控股', type:'distributor', contactName:'王经理',
          contactPhone:'13800138003', address:{ city:'广州', district:'越秀区' },
          enabled:true, createdAt:new Date() },
        { _id:'c4', name:'阿里健康大药房', type:'pharmacy', contactName:'赵店长',
          contactPhone:'13800138004', address:{ city:'杭州', district:'余杭区' },
          enabled:false, createdAt:new Date() },
      ];
      const { type, enabled, name } = query;
      let filtered = mockCustomers;
      if (type) filtered = filtered.filter(c => c.type === type);
      if (enabled !== undefined) filtered = filtered.filter(c => c.enabled === (enabled === 'true'));
      if (name) filtered = filtered.filter(c => c.name.includes(name));
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, type, enabled, name } = query;
    const filter: any = {};
    if (type) filter.type = type;
    if (enabled !== undefined) filter.enabled = enabled === 'true';
    if (name) filter.name = { $regex: name, $options: 'i' };

    const [data, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.customerModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: any) {
    const customer = new this.customerModel(dto);
    return customer.save();
  }

  async update(id: string, dto: any) {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async remove(id: string) {
    const result = await this.customerModel.deleteOne({ _id: id }).exec();
    return { id, deleted: result.deletedCount > 0 };
  }

  async searchByName(keyword: string) {
    return this.customerModel
      .find({ $or: [{ name: { $regex: keyword, $options: 'i' } }, { $text: { $search: keyword } }] })
      .sort({ createdAt: -1 })
      .exec();
  }
}
