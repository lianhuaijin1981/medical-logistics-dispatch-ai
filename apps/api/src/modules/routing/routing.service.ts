import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoutePlan, RoutePlanDocument, RouteAlgorithm } from './routing.schema';

@Injectable()
export class RoutingService {
  constructor(
    @InjectModel(RoutePlan.name) private routeModel: Model<RoutePlanDocument>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, dispatchId, vehicleId, algorithm } = query;
    const filter: any = {};
    if (dispatchId) filter.dispatchId = dispatchId;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (algorithm) filter.algorithm = algorithm;

    const [data, total] = await Promise.all([
      this.routeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('dispatchId', 'taskNo status')
        .populate('vehicleId', 'plateNumber')
        .exec(),
      this.routeModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const route = await this.routeModel
      .findById(id)
      .populate('dispatchId', 'taskNo status driverId vehicleId')
      .populate('vehicleId', 'plateNumber type')
      .exec();
    if (!route) throw new NotFoundException(`路径规划 ${id} 未找到`);
    return route;
  }

  async findByDispatch(dispatchId: string) {
    const route = await this.routeModel
      .findOne({ dispatchId })
      .sort({ createdAt: -1 })
      .exec();
    if (!route) throw new NotFoundException(`调度任务 ${dispatchId} 的路径规划未找到`);
    return route;
  }

  async create(dto: any) {
    const route = new this.routeModel({
      ...dto,
      calculatedAt: new Date(),
    });
    return route.save();
  }

  async update(id: string, dto: any) {
    const route = await this.routeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!route) throw new NotFoundException(`路径规划 ${id} 未找到`);
    return route;
  }

  async remove(id: string) {
    const result = await this.routeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`路径规划 ${id} 未找到`);
    return { id, deleted: true };
  }
}
