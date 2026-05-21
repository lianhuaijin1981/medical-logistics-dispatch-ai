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
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
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
