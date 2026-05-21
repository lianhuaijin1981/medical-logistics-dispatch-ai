import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, status, priority, warehouseId, customerId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (customerId) filter.customerId = customerId;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId')
      .populate('warehouseId')
      .exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(dto: any) {
    const orderNo = this.generateOrderNo();
    const order = new this.orderModel({
      ...dto,
      orderNo,
      status: dto.status || OrderStatus.PENDING,
      statusHistory: [
        {
          status: dto.status || OrderStatus.PENDING,
          timestamp: new Date(),
          operator: dto.operator || 'system',
          remark: '订单创建',
        },
      ],
    });
    return order.save();
  }

  async update(id: string, dto: any) {
    const existing = await this.orderModel.findById(id).exec();
    if (!existing) throw new NotFoundException(`Order ${id} not found`);

    const statusChanged = dto.status && dto.status !== existing.status;
    if (statusChanged) {
      if (!dto.statusHistory) {
        dto.statusHistory = [
          ...existing.statusHistory,
          {
            status: dto.status,
            timestamp: new Date(),
            operator: dto.operator || 'system',
            remark: dto.remark || `状态变更为 ${dto.status}`,
          },
        ];
      }
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return order;
  }

  async remove(id: string) {
    const result = await this.orderModel.deleteOne({ _id: id }).exec();
    return { id, deleted: result.deletedCount > 0 };
  }

  async findByStatus(status: string, limit?: number) {
    const query = this.orderModel
      .find({ status })
      .sort({ createdAt: -1 });
    if (limit) query.limit(limit);
    return query.exec();
  }

  private generateOrderNo(): string {
    const now = new Date();
    const dateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `MD-${dateStr}-${random}`;
  }
}
