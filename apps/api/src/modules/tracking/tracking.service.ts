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
    // DEV MODE: return mock data
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      const mockTracks = [
        { _id:'t1', vehicleId:'v1', driverId:'d1', dispatchId:'dt1',
          location:{ type:'Point', coordinates:[116.397,39.908] },
          timestamp:new Date(now-60000), speed:42, heading:45,
          odometer:45000, event:'normal', createdAt:new Date() },
        { _id:'t2', vehicleId:'v2', driverId:'d2', dispatchId:'dt2',
          location:{ type:'Point', coordinates:[121.501,31.235] },
          timestamp:new Date(now-30000), speed:38, heading:120,
          odometer:78000, event:'normal', createdAt:new Date() },
        { _id:'t3', vehicleId:'v1', driverId:'d1', dispatchId:'dt1',
          location:{ type:'Point', coordinates:[116.407,39.918] },
          timestamp:new Date(), speed:35, heading:47,
          odometer:45005, event:'normal', createdAt:new Date() },
      ];
      const { vehicleId, dispatchId, driverId } = query;
      let filtered = mockTracks;
      if (vehicleId) filtered = filtered.filter(t => t.vehicleId === vehicleId);
      if (dispatchId) filtered = filtered.filter(t => t.dispatchId === dispatchId);
      if (driverId) filtered = filtered.filter(t => t.driverId === driverId);
      return { items: filtered, total: filtered.length, page: Number(query.page)||1, pageSize: Number(query.pageSize)||50 };
    }

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
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
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
