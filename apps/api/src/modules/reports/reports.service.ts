import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument, ReportType, ReportStatus, ReportFormat } from './report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 20, type, status, createdBy, warehouseId } = query;
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (warehouseId) filter.warehouseId = warehouseId;

    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .select('-data') // 列表不返回详细数据
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .populate('createdBy', 'realName username')
        .exec(),
      this.reportModel.countDocuments(filter).exec(),
    ]);
    return { items: data, total: Number(total), page: Number(page), pageSize: Number(pageSize) };
  }

  async findOne(id: string) {
    const report = await this.reportModel
      .findById(id)
      .populate('createdBy', 'realName username')
      .populate('warehouseId', 'name code')
      .exec();
    if (!report) throw new NotFoundException(`报表 ${id} 未找到`);
    return report;
  }

  async create(dto: any) {
    const report = new this.reportModel({
      ...dto,
      status: ReportStatus.DRAFT,
    });
    return report.save();
  }

  async update(id: string, dto: any) {
    const report = await this.reportModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!report) throw new NotFoundException(`报表 ${id} 未找到`);
    return report;
  }

  async generate(id: string, summary?: any, data?: any, file?: any) {
    const update: any = {
      status: ReportStatus.COMPLETED,
      generatedAt: new Date(),
    };
    if (summary) update.summary = summary;
    if (data) update.data = data;
    if (file) update.file = file;

    const report = await this.reportModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!report) throw new NotFoundException(`报表 ${id} 未找到`);
    return report;
  }

  async failGenerate(id: string, errorMessage: string) {
    const report = await this.reportModel
      .findByIdAndUpdate(
        id,
        { status: ReportStatus.FAILED, errorMessage },
        { new: true },
      )
      .exec();
    if (!report) throw new NotFoundException(`报表 ${id} 未找到`);
    return report;
  }

  async remove(id: string) {
    const result = await this.reportModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`报表 ${id} 未找到`);
    return { id, deleted: true };
  }
}
