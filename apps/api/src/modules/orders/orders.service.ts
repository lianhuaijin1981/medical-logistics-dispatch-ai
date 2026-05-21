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
    // DEV MODE: return realistic mock data
    if (process.env.NODE_ENV === 'development') {
      const mockOrders = [
        { _id:'1', orderNo:'YX20250601001', customerId:'c1', warehouseId:'w1',
          items:[{sku:'SKU001',name:'阿司匹林',quantity:2,unit:'盒',unitPrice:15.50}],
          status:'pending', priority:'normal', totalAmount:31, temperatureRequirements:['ambient'],
          createdAt: new Date(), updatedAt: new Date() },
        { _id:'2', orderNo:'YX20250601002', customerId:'c2', warehouseId:'w1',
          items:[{sku:'SKU002',name:'生理盐水',quantity:10,unit:'瓶',unitPrice:3.80}],
          status:'processing', priority:'urgent', totalAmount:38, temperatureRequirements:['cold'],
          createdAt: new Date(Date.now()-3600000), updatedAt: new Date() },
        { _id:'3', orderNo:'YX20250601003', customerId:'c1', warehouseId:'w2',
          items:[{sku:'SKU003',name:'头孢克肟',quantity:5,unit:'盒',unitPrice:22.00}],
          status:'dispatching', priority:'normal', totalAmount:110, temperatureRequirements:['room'],
          createdAt: new Date(Date.now()-7200000), updatedAt: new Date() },
        { _id:'4', orderNo:'YX20250601004', customerId:'c3', warehouseId:'w1',
          items:[{sku:'SKU004',name:'医用口罩',quantity:100,unit:'只',unitPrice:0.85}],
          status:'delivered', priority:'normal', totalAmount:85, temperatureRequirements:[],
          createdAt: new Date(Date.now()-86400000), updatedAt: new Date() },
        { _id:'5', orderNo:'YX20250601005', customerId:'c2', warehouseId:'w2',
          items:[{sku:'SKU005',name:'胰岛素注射液',quantity:3,unit:'支',unitPrice:45.00}],
          status:'in_transit', priority:'critical', totalAmount:135, temperatureRequirements:['cold'],
          createdAt: new Date(Date.now()-1800000), updatedAt: new Date() },
      ];
      const { status } = query;
      const filtered = status ? mockOrders.filter(o => o.status === status) : mockOrders;
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, status, priority, warehouseId, customerId, keyword, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (customerId) filter.customerId = customerId;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total, page: Number(page), pageSize: Number(pageSize) };
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
