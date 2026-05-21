import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './alert.schema';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockAlerts = [
        { _id:'a1', level:'critical', message:'北京中央仓 温度异常：当前 12.3°C，超出阈值',
          source:'cold_chain', sourceId:'cc3', resolved:false,
          timestamp:new Date(Date.now()-1800000), createdAt:new Date() },
        { _id:'a2', level:'warning', message:'车辆 沪B·X5678 偏离路线',
          source:'dispatch', sourceId:'dt2', resolved:false,
          timestamp:new Date(Date.now()-600000), createdAt:new Date() },
        { _id:'a3', level:'warning', message:'SKU003 库存低于安全库存（当前 15 < 安全库存 20）',
          source:'inventory', sourceId:'i3', resolved:false,
          timestamp:new Date(Date.now()-3600000), createdAt:new Date() },
        { _id:'a4', level:'info', message:'订单 YX20250601001 已创建，等待处理',
          source:'order', sourceId:'o1', resolved:true,
          timestamp:new Date(Date.now()-7200000), resolvedAt:new Date(Date.now()-7100000),
          resolvedBy:'admin', createdAt:new Date() },
        { _id:'a5', level:'critical', message:'广州冷链仓 电力异常，切换到备用电源',
          source:'warehouse', sourceId:'w3', resolved:false,
          timestamp:new Date(), createdAt:new Date() },
      ];
      const { level, resolved } = query;
      let filtered = mockAlerts;
      if (level) filtered = filtered.filter(a => a.level === level);
      if (resolved !== undefined) filtered = filtered.filter(a => a.resolved === (resolved === 'true'));
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, level, resolved } = query;
    const filter: any = {};
    if (level) filter.level = level;
    if (resolved !== undefined) filter.resolved = resolved === 'true' || resolved === true;

    const [data, total] = await Promise.all([
      this.alertModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.alertModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const alert = await this.alertModel.findById(id).exec();
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }

  async resolve(id: string, note?: string, resolvedBy?: string) {
    const alert = await this.alertModel.findByIdAndUpdate(
      id,
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNote: note,
      },
      { new: true },
    ).exec();
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }
}
