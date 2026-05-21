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
        .populate('driverId', 'name phone')
        .exec(),
      this.dispatchModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const dispatch = await this.dispatchModel
      .findById(id)
      .populate('vehicleId', 'plateNumber type brand vehicleModel')
      .populate('driverId', 'name phone licenseNumber')
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
