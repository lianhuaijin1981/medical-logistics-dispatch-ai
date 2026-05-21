import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DispatchStatus, DispatchPriority } from './dispatch.enum';

export { DispatchStatus, DispatchPriority };

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DispatchTask extends Document {
  @Prop({ required: true, unique: true, index: true })
  taskNo: string;

  @Prop({ type: String, ref: 'Vehicle', required: true, index: true })
  vehicleId: string;

  @Prop({ type: String, ref: 'Driver', required: true, index: true })
  driverId: string;

  @Prop({ type: String, ref: 'Warehouse', required: true, index: true })
  warehouseId: string;

  @Prop({ type: [{ type: String, ref: 'Order' }], required: true })
  orderIds: string[];

  @Prop({
    required: true,
    enum: Object.values(DispatchStatus),
    default: DispatchStatus.PENDING,
    index: true,
  })
  status: DispatchStatus;

  @Prop({ enum: Object.values(DispatchPriority), default: DispatchPriority.NORMAL })
  priority: DispatchPriority;

  // 路径规划（嵌入）
  @Prop({ type: Object })
  route?: {
    routeId: string;
    stops: {
      sequence: number;
      orderId: string;
      type: 'pickup' | 'delivery';
      address: {
        province: string;
        city: string;
        district: string;
        detail: string;
        contactName: string;
        contactPhone: string;
        location?: { type: string; coordinates: number[] };
      };
      estimatedArrival: Date;
      estimatedDeparture: Date;
      serviceTime: number;       // seconds
      distanceFromPrev: number;   // meters
      actualArrival?: Date;
      actualDeparture?: Date;
      status: 'pending' | 'arrived' | 'completed' | 'skipped';
    }[];
    totalDistance: number;       // meters
    totalDuration: number;       // seconds
    geometry?: { type: string; coordinates: number[][] };
    algorithm: string;
    trafficConsidered: boolean;
  };

  @Prop({ required: true, min: 0 })
  totalWeight: number; // kg

  @Prop({ required: true, min: 0 })
  totalVolume: number; // m³

  @Prop({ required: true, min: 0 })
  orderCount: number;

  @Prop({ type: Number, default: 0 })
  estimatedDistance: number; // meters

  @Prop({ type: Number, default: 0 })
  estimatedDuration: number; // seconds

  @Prop({ type: Date })
  departureTime?: Date;

  @Prop({ type: Date })
  arrivalTime?: Date;

  @Prop({ type: Number })
  actualDistance?: number; // meters

  @Prop({ type: Number })
  actualDuration?: number; // seconds

  @Prop({ type: [String] })
  temperatureZones?: string[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [Object], default: [] })
  statusHistory: {
    status: DispatchStatus;
    timestamp: Date;
    operator: string;
    remark?: string;
  }[];

  // 签收信息
  @Prop({ type: Object })
  signOff?: {
    signatureImage?: string;  // base64 or URL
    signerName: string;
    signerPhone: string;
    signedAt: Date;
    remark?: string;
  };
}

export const DispatchTaskSchema = SchemaFactory.createForClass(DispatchTask);
export type DispatchTaskDocument = DispatchTask & Document;

// 索引
DispatchTaskSchema.index({ vehicleId: 1, status: 1 });
DispatchTaskSchema.index({ driverId: 1, status: 1 });
DispatchTaskSchema.index({ warehouseId: 1, status: 1 });
DispatchTaskSchema.index({ status: 1, createdAt: -1 });
DispatchTaskSchema.index({ departureTime: 1 });
DispatchTaskSchema.index({ 'route.stops.address.location': '2dsphere' });
