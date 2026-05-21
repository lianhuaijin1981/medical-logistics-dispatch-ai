import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GPSTrack, GPSTrackDocument } from './tracking.schema';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(GPSTrack.name) private trackModel: Model<GPSTrackDocument>,
  ) {}

  async findAll(query: any) {
    const {
      page = 1, pageSize = 50,
      vehicleId, dispatchId, driverId,
      startTime, endTime,
    } = query;
    const filter: any = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    if (dispatchId) filter.dispatchId = dispatchId;
    if (driverId) filter.driverId = driverId;
    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime);
      if (endTime) filter.timestamp.$lte = new Date(endTime);
    }

    const [data, total] = await Promise.all([
      this.trackModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .exec(),
      this.trackModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const track = await this.trackModel.findById(id).exec();
    if (!track) throw new NotFoundException(`GPS 轨迹 ${id} 未找到`);
    return track;
  }

  async findLatest(vehicleId: string) {
    const track = await this.trackModel
      .findOne({ vehicleId })
      .sort({ timestamp: -1 })
      .exec();
    if (!track) throw new NotFoundException(`车辆 ${vehicleId} 无 GPS 数据`);
    return track;
  }

  async findTrackByDispatch(dispatchId: string, limit = 500) {
    return this.trackModel
      .find({ dispatchId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .exec();
  }

  async findTrackByTimeRange(vehicleId: string, startTime: string, endTime: string) {
    return this.trackModel
      .find({
        vehicleId,
        timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) },
      })
      .sort({ timestamp: 1 })
      .limit(2000)
      .exec();
  }

  async create(dto: any) {
    const track = new this.trackModel(dto);
    return track.save();
  }

  async batchCreate(tracks: any[]) {
    return this.trackModel.insertMany(tracks);
  }

  async remove(id: string) {
    const result = await this.trackModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`GPS 轨迹 ${id} 未找到`);
    return { id, deleted: true };
  }
}
