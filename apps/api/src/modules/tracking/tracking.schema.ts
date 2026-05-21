import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GPSTrack extends Document {
  @Prop({ type: String, ref: 'Vehicle', required: true, index: true })
  vehicleId: string;

  @Prop({ type: String, ref: 'DispatchTask', required: true, index: true })
  dispatchId: string;

  @Prop({ type: String, ref: 'Driver' })
  driverId?: string;

  @Prop({ required: true, type: Date, index: true })
  timestamp: Date;

  @Prop({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  })
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };

  @Prop({ required: true, min: 0 })
  speed: number; // km/h

  @Prop({ required: true, min: 0, max: 360 })
  heading: number; // degrees, 0-360

  @Prop({ type: Number, min: 0 })
  accuracy?: number; // GPS 精度（米）

  @Prop({ type: Number })
  altitude?: number; // 海拔（米）

  @Prop({ type: Number })
  batteryLevel?: number; // 设备电量百分比

  @Prop({ type: Number })
  signalStrength?: number; // GPS 信号强度

  // 累积里程（从本次 dispatch 开始）
  @Prop({ type: Number })
  cumulativeDistance?: number; // meters

  // 地址反解析结果（高德）
  @Prop({ type: Object })
  address?: {
    formattedAddress: string;
    province: string;
    city: string;
    district: string;
    street: string;
    number: string;
  };
}

export const GPSTrackSchema = SchemaFactory.createForClass(GPSTrack);
export type GPSTrackDocument = GPSTrack & Document;

// 索引
GPSTrackSchema.index({ vehicleId: 1, timestamp: -1 });
GPSTrackSchema.index({ dispatchId: 1, timestamp: -1 });
GPSTrackSchema.index({ location: '2dsphere' });
GPSTrackSchema.index({ timestamp: -1 });

// TTL: GPS 数据 90 天后自动清理（原始数据仅用于热查询，历史归档到 InfluxDB）
// GPSTrackSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });
