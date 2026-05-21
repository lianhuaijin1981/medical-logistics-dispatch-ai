import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PickingTask, PickingTaskDocument, PickingMethod, PickingStatus } from './picking.schema';

@Injectable()
export class PickingService {
  constructor(
    @InjectModel(PickingTask.name) private pickingModel: Model<PickingTaskDocument>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, status, method, warehouseId, assignedTo, waveNo } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (waveNo) filter.waveNo = waveNo;

    const [data, total] = await Promise.all([
      this.pickingModel
        .find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('warehouseId', 'name code')
        .populate('assignedTo', 'realName')
        .populate('orderIds', 'orderNo status')
        .exec(),
      this.pickingModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const task = await this.pickingModel
      .findById(id)
      .populate('warehouseId', 'name code')
      .populate('assignedTo', 'realName')
      .populate('orderIds', 'orderNo status totalWeight')
      .exec();
    if (!task) throw new NotFoundException(`拣货任务 ${id} 未找到`);
    return task;
  }

  async findByWave(waveNo: string) {
    return this.pickingModel
      .find({ waveNo })
      .sort({ createdAt: -1 })
      .populate('orderIds', 'orderNo')
      .exec();
  }

  async create(dto: any) {
    // Auto-generate taskNo: PK-YYYYMMDD-XXXXX
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.pickingModel.countDocuments({
      taskNo: { $regex: `PK-${today}` },
    });
    const seq = String(count + 1).padStart(4, '0');
    const taskNo = `PK-${today}-${seq}`;

    const task = new this.pickingModel({
      ...dto,
      taskNo,
      status: PickingStatus.PENDING,
      statusHistory: [{
        status: PickingStatus.PENDING,
        timestamp: new Date(),
        operator: dto.operator || '系统',
        remark: '拣货任务创建',
      }],
    });
    return task.save();
  }

  async update(id: string, dto: any) {
    const task = await this.pickingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!task) throw new NotFoundException(`拣货任务 ${id} 未找到`);
    return task;
  }

  async startPicking(id: string, operator: string) {
    const task = await this.pickingModel.findById(id).exec();
    if (!task) throw new NotFoundException(`拣货任务 ${id} 未找到`);
    if (task.status !== PickingStatus.PENDING) {
      throw new Error(`任务状态为 ${task.status}，无法开始拣货`);
    }

    task.status = PickingStatus.IN_PROGRESS;
    task.startedAt = new Date();
    task.statusHistory.push({
      status: PickingStatus.IN_PROGRESS,
      timestamp: new Date(),
      operator,
      remark: '开始拣货',
    });
    return task.save();
  }

  async completePicking(id: string, operator: string, items?: any[]) {
    const task = await this.pickingModel.findById(id).exec();
    if (!task) throw new NotFoundException(`拣货任务 ${id} 未找到`);

    task.status = PickingStatus.COMPLETED;
    task.completedAt = new Date();
    task.pickedItems = items?.length || task.items?.length || 0;
    task.statusHistory.push({
      status: PickingStatus.COMPLETED,
      timestamp: new Date(),
      operator,
      remark: '拣货完成',
    });
    return task.save();
  }

  async remove(id: string) {
    const result = await this.pickingModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`拣货任务 ${id} 未找到`);
    return { id, deleted: true };
  }
}
