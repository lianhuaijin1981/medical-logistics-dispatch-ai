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
    const { page = 1, pageSize = 20, level, resolved } = query;
    const filter: any = {};
    if (level) filter.level = level;
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const [data, total] = await Promise.all([
      this.alertModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.alertModel.countDocuments(filter).exec(),
    ]);
    return { data, total, page: Number(page), pageSize: Number(pageSize) };
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
