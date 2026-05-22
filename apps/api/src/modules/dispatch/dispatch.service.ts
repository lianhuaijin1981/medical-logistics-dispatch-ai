import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DispatchTask, DispatchTaskDocument, DispatchStatus, DispatchPriority } from './dispatch.schema';

@Injectable()
export class DispatchService {
  constructor(
    @InjectModel(DispatchTask.name) private dispatchModel: Model<DispatchTaskDocument>,
  ) {}

  async findAll(query: any) {
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockTasks = [
        { _id:'dt1', taskNo:'DIS-20250601-001', vehicleId:'v1', driverId:'d1',
          warehouseId:'w1', orderIds:['o1','o2'], status:'dispatching',
          priority:'normal', totalWeight:28.5, totalVolume:0.8,
          estimatedDistance:12.3, estimatedDuration:45, createdAt:new Date() },
        { _id:'dt2', taskNo:'DIS-20250601-002', vehicleId:'v2', driverId:'d2',
          warehouseId:'w2', orderIds:['o3'], status:'in_transit',
          priority:'urgent', totalWeight:15.2, totalVolume:0.5,
          estimatedDistance:8.7, estimatedDuration:30, createdAt:new Date(Date.now()-3600000) },
        { _id:'dt3', taskNo:'DIS-20250601-003', vehicleId:'v4', driverId:'d3',
          warehouseId:'w1', orderIds:['o4','o5','o6'], status:'delivered',
          priority:'normal', totalWeight:42.0, totalVolume:1.2,
          estimatedDistance:18.5, estimatedDuration:60, createdAt:new Date(Date.now()-7200000) },
      ];
      const { status, vehicleId, driverId, warehouseId, priority } = query;
      let filtered = mockTasks;
      if (status) filtered = filtered.filter(t => t.status === status);
      if (vehicleId) filtered = filtered.filter(t => t.vehicleId === vehicleId);
      if (driverId) filtered = filtered.filter(t => t.driverId === driverId);
      if (warehouseId) filtered = filtered.filter(t => t.warehouseId === warehouseId);
      if (priority) filtered = filtered.filter(t => t.priority === priority);
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||20 };
    }

    const { page = 1, pageSize = 20, status, vehicleId, driverId, warehouseId, priority, keyword } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (priority) filter.priority = priority;
    if (keyword) {
      filter.taskNo = { $regex: keyword, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.dispatchModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('vehicleId', 'plateNumber type')
        .populate('driverId', 'realName phone')
        .exec(),
      this.dispatchModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const dispatch = await this.dispatchModel
      .findById(id)
      .populate('vehicleId', 'plateNumber type brand vehicleModel')
      .populate('driverId', 'realName phone licenseNumber')
      .populate('warehouseId', 'name code')
      .populate('orderIds', 'orderNo status totalWeight')
      .exec();
    if (!dispatch) throw new NotFoundException(`调度任务 ${id} 未找到`);
    return dispatch;
  }

  async findByVehicle(vehicleId: string) {
    return this.dispatchModel
      .find({ vehicleId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async findByDriver(driverId: string) {
    return this.dispatchModel
      .find({ driverId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async create(dto: any) {
    // Auto-generate taskNo: DP-YYYYMMDD-XXXXX
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.dispatchModel.countDocuments({
      taskNo: { $regex: `DP-${today}` },
    });
    const seq = String(count + 1).padStart(4, '0');
    const taskNo = `DP-${today}-${seq}`;

    const dispatch = new this.dispatchModel({
      ...dto,
      taskNo,
      status: DispatchStatus.PENDING,
      statusHistory: [{
        status: DispatchStatus.PENDING,
        timestamp: new Date(),
        operator: dto.operator || '系统',
        remark: '调度任务创建',
      }],
    });
    return dispatch.save();
  }

  async update(id: string, dto: any) {
    const dispatch = await this.dispatchModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!dispatch) throw new NotFoundException(`调度任务 ${id} 未找到`);
    return dispatch;
  }

  async updateStatus(id: string, status: DispatchStatus, operator?: string, remark?: string) {
    const update: any = { status };
    if (status === DispatchStatus.DEPARTED) update.departureTime = new Date();
    if (status === DispatchStatus.COMPLETED) update.arrivalTime = new Date();

    const dispatch = await this.dispatchModel.findById(id).exec();
    if (!dispatch) throw new NotFoundException(`调度任务 ${id} 未找到`);

    dispatch.status = status;
    if (update.departureTime) dispatch.departureTime = update.departureTime;
    if (update.arrivalTime) dispatch.arrivalTime = update.arrivalTime;
    dispatch.statusHistory.push({
      status,
      timestamp: new Date(),
      operator: operator || '系统',
      remark,
    });

    return dispatch.save();
  }

  async remove(id: string) {
    const result = await this.dispatchModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`调度任务 ${id} 未找到`);
    return { id, deleted: true };
  }
}
