import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TemperatureZone {
  AMBIENT = 'ambient',   // 常温 15~25°C
  COOL = 'cool',         // 阴凉 ≤20°C
  COLD = 'cold',         // 冷藏 2~8°C
  FROZEN = 'frozen',     // 冷冻 ≤-18°C
}

export enum ColdChainAlertStatus {
  NORMAL = 'normal',       // 正常
  WARNING = 'warning',     // 接近阈值
  BREACH = 'breach',       // 超温
  RECOVERED = 'recovered', // 已恢复
}

@Schema({ timestamps: true })
export class ColdChainRecord extends Document {
  @Prop({ type: String, ref: 'DispatchTask', required: true, index: true })
  dispatchId: string;

  @Prop({ type: String, ref: 'Vehicle', required: true, index: true })
  vehicleId: string;

  @Prop({ type: [{ type: String, ref: 'Order' }], required: true })
  orderIds: string[];

  @Prop({ required: true, type: Date, index: true })
  timestamp: Date;

  @Prop({ required: true })
  temperature: number; // °C

  @Prop({ type: Number })
  humidity?: number; // % 相对湿度

  @Prop({ required: true, enum: Object.values(TemperatureZone) })
  zone: TemperatureZone;

  // 该温区的正常范围
  @Prop({ type: Object, required: true })
  rangeLimit: {
    min: number;
    max: number;
    unit: string; // '°C'
  };

  @Prop({ required: true })
  withinRange: boolean;

  @Prop({ required: true, enum: Object.values(ColdChainAlertStatus), default: ColdChainAlertStatus.NORMAL })
  alertStatus: ColdChainAlertStatus;

  @Prop({ default: false })
  alertGenerated: boolean;

  @Prop({ type: String, ref: 'Alert' })
  alertId?: string;

  // 传感器信息
  @Prop({ type: Object })
  sensor?: {
    sensorId: string;
    position: string;    // 传感器安装位置（前/中/后/左/右）
    lastCalibratedAt?: Date;
  };

  // 设备信息
  @Prop({ type: String })
  deviceId?: string; // 冷链设备ID

  @Prop({ type: Number })
  doorOpenCount?: number; // 本次配送累计开门次数

  @Prop({ type: Number })
  compressorRuntime?: number; // 压缩机累计运行时长（分钟）
}

export const ColdChainRecordSchema = SchemaFactory.createForClass(ColdChainRecord);
export type ColdChainRecordDocument = ColdChainRecord & Document;

// 索引
ColdChainRecordSchema.index({ dispatchId: 1, timestamp: -1 });
ColdChainRecordSchema.index({ vehicleId: 1, timestamp: -1 });
ColdChainRecordSchema.index({ withinRange: 1, alertGenerated: 1 });
ColdChainRecordSchema.index({ zone: 1, timestamp: -1 });
ColdChainRecordSchema.index({ alertStatus: 1, createdAt: -1 });

// TTL: 原始温控数据保留 180 天后自动清理（历史归档到 InfluxDB）
// ColdChainRecordSchema.index({ timestamp: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });
