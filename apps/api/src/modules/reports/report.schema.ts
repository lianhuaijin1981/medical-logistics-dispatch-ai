import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReportType, ReportStatus, ReportPeriodType, ReportFormat } from './report.enum';

export { ReportType, ReportStatus, ReportPeriodType, ReportFormat };

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true, enum: Object.values(ReportType), index: true })
  type: ReportType;

  @Prop({ required: true, enum: Object.values(ReportStatus), default: ReportStatus.DRAFT, index: true })
  status: ReportStatus;

  @Prop({ required: true, enum: Object.values(ReportPeriodType), default: ReportPeriodType.DAILY })
  periodType: ReportPeriodType;

  @Prop({ type: Object, required: true })
  dateRange: {
    start: Date;
    end: Date;
  };

  @Prop({ required: true, enum: Object.values(ReportFormat), default: ReportFormat.PDF })
  format: ReportFormat;

  // 关联的实体（用于数据筛选）
  @Prop({ type: String, ref: 'Warehouse' })
  warehouseId?: string;

  @Prop({ type: [{ type: String, ref: 'Vehicle' }] })
  vehicleIds?: string[];

  @Prop({ type: [{ type: String, ref: 'Driver' }] })
  driverIds?: string[];

  @Prop({ type: String, ref: 'User', required: true })
  createdBy: string;

  // 报表数据摘要（JSON）
  @Prop({ type: Object })
  summary?: {
    totalOrders?: number;
    totalAmount?: number;
    totalDistance?: number;
    totalDuration?: number;
    avgTemperature?: number;
    breachCount?: number;
    vehicleUtilization?: number;
    driverEfficiency?: number;
    [key: string]: any; // 各类型报表可能有不同指标
  };

  // 详细数据（大数据量时仅存引用，数据存 MinIO）
  @Prop({ type: Object })
  data?: Record<string, any>;

  // 文件存储位置
  @Prop({ type: Object })
  file?: {
    storage: 'local' | 'minio' | 'cos';  // 存储后端
    bucket: string;
    key: string;        // 对象存储 key
    url: string;        // 访问 URL
    size: number;       // 文件大小（bytes）
    md5?: string;
  };

  @Prop({ type: Date })
  generatedAt?: Date;

  @Prop({ type: Number })
  generationDuration?: number; // ms

  @Prop({ type: String })
  errorMessage?: string; // 生成失败时的错误信息

  // 调度配置（定时报表）
  @Prop({ type: Object })
  schedule?: {
    enabled: boolean;
    cronExpression?: string;
    recipients?: string[];   // 邮件接收人
    wechatRecipients?: string[]; // 企微接收人
    nextRunAt?: Date;
    lastRunAt?: Date;
  };
}

export const ReportSchema = SchemaFactory.createForClass(Report);
export type ReportDocument = Report & Document;

// 索引
ReportSchema.index({ type: 1, status: 1, createdAt: -1 });
ReportSchema.index({ createdBy: 1, createdAt: -1 });
ReportSchema.index({ warehouseId: 1, type: 1 });
ReportSchema.index({ 'dateRange.start': 1, 'dateRange.end': 1 });
ReportSchema.index({ 'schedule.nextRunAt': 1, 'schedule.enabled': 1 });
