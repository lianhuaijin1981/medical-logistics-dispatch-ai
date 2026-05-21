import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ColdChainRecord, ColdChainRecordDocument, ColdChainAlertStatus } from './cold-chain.schema';

@Injectable()
export class ColdChainService {
  constructor(
    @InjectModel(ColdChainRecord.name) private ccModel: Model<ColdChainRecordDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockRecords = [
        { _id:'cc1', dispatchId:'dt1', vehicleId:'v1', zone:'cold',
          timestamp: new Date(), temperature:4.5, humidity:55,
          withinRange:true, alertStatus:'normal', createdAt:new Date() },
        { _id:'cc2', dispatchId:'dt2', vehicleId:'v2', zone:'frozen',
          timestamp:new Date(Date.now()-1800000), temperature:-2.1, humidity:40,
          withinRange:true, alertStatus:'normal', createdAt:new Date() },
        { _id:'cc3', dispatchId:'dt1', vehicleId:'v1', zone:'cold',
          timestamp:new Date(Date.now()-3600000), temperature:8.9, humidity:60,
          withinRange:false, alertStatus:'warning',
          notes:'温度传感器异常，温度升高', createdAt:new Date() },
        { _id:'cc4', dispatchId:'dt3', vehicleId:'v4', zone:'ambient',
          timestamp:new Date(Date.now()-7200000), temperature:22.5, humidity:50,
          withinRange:true, alertStatus:'normal', createdAt:new Date() },
      ];
      const { dispatchId, vehicleId, zone, withinRange, alertStatus } = query;
      let filtered = mockRecords;
      if (dispatchId) filtered = filtered.filter(r => r.dispatchId === dispatchId);
      if (vehicleId) filtered = filtered.filter(r => r.vehicleId === vehicleId);
      if (zone) filtered = filtered.filter(r => r.zone === zone);
      if (withinRange !== undefined) filtered = filtered.filter(r => r.withinRange === (withinRange === 'true' || withinRange === true));
      if (alertStatus) filtered = filtered.filter(r => r.alertStatus === alertStatus);
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const {
      page = 1, pageSize = 20,
      dispatchId, vehicleId, zone,
      withinRange, alertStatus,
      startTime, endTime,
    } = query;
    const filter: any = {};
    if (dispatchId) filter.dispatchId = dispatchId;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (zone) filter.zone = zone;
    if (withinRange !== undefined) filter.withinRange = withinRange === 'true' || withinRange === true;
    if (alertStatus) filter.alertStatus = alertStatus;
    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime);
      if (endTime) filter.timestamp.$lte = new Date(endTime);
    }

    const [data, total] = await Promise.all([
      this.ccModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('dispatchId', 'taskNo')
        .populate('vehicleId', 'plateNumber')
        .exec(),
      this.ccModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const record = await this.ccModel
      .findById(id)
      .populate('dispatchId', 'taskNo status')
      .populate('vehicleId', 'plateNumber type')
      .exec();
    if (!record) throw new NotFoundException(`冷链记录 ${id} 未找到`);
    return record;
  }

  async findByDispatch(dispatchId: string, limit = 500) {
    return this.ccModel
      .find({ dispatchId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .exec();
  }

  async findBreaches(query: any) {
    const { page = 1, pageSize = 20, dispatchId, vehicleId } = query;
    const filter: any = { alertStatus: ColdChainAlertStatus.BREACH };
    if (dispatchId) filter.dispatchId = dispatchId;
    if (vehicleId) filter.vehicleId = vehicleId;

    const [data, total] = await Promise.all([
      this.ccModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .exec(),
      this.ccModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async create(dto: any) {
    // Auto-determine withinRange and alertStatus
    if (dto.rangeLimit && dto.temperature !== undefined) {
      dto.withinRange = dto.temperature >= dto.rangeLimit.min && dto.temperature <= dto.rangeLimit.max;
      if (!dto.withinRange && !dto.alertStatus) {
        dto.alertStatus = ColdChainAlertStatus.BREACH;
        dto.alertGenerated = true;
      }
    }
    const record = new this.ccModel(dto);
    return record.save();
  }

  async batchCreate(records: any[]) {
    return this.ccModel.insertMany(records);
  }

  async remove(id: string) {
    const result = await this.ccModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`冷链记录 ${id} 未找到`);
    return { id, deleted: true };
  }
}
