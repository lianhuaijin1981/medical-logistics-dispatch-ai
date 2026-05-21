import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PickingMethod, PickingStatus } from './picking.enum';

export { PickingMethod, PickingStatus };

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class PickingTask extends Document {
  @Prop({ required: true, unique: true, index: true })
  taskNo: string;

  @Prop({ type: String, ref: 'Warehouse', required: true, index: true })
  warehouseId: string;

  @Prop({ required: true, enum: Object.values(PickingMethod), default: PickingMethod.WAVE })
  method: PickingMethod;

  @Prop({ required: true, enum: Object.values(PickingStatus), default: PickingStatus.PENDING, index: true })
  status: PickingStatus;

  @Prop({ type: [{ type: String, ref: 'Order' }], required: true })
  orderIds: string[];

  @Prop({ type: [Object], required: true })
  items: {
    sku: string;
    name: string;
    orderNo: string;
    location: string;
    pickQuantity: number;
    actualQuantity?: number;
    batchNo: string;
    expiryDate: Date;
    pickedAt?: Date;
    exceptionNote?: string;
  }[];

  @Prop({ type: String, ref: 'User' })
  assignedTo?: string;

  @Prop({ type: String })
  zone?: string; // 库区编码（分区拣货时使用）

  @Prop({ type: Number, default: 0 })
  priority: number; // 优先级 0-10, 越高越优先

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  cancelReason?: string;

  @Prop({ type: [Object], default: [] })
  statusHistory: {
    status: PickingStatus;
    timestamp: Date;
    operator: string;
    remark?: string;
  }[];

  // 波次信息（wave/batch 模式）
  @Prop({ type: String })
  waveNo?: string;

  @Prop({ type: Number })
  totalItems?: number;

  @Prop({ type: Number })
  pickedItems?: number;
}

export const PickingTaskSchema = SchemaFactory.createForClass(PickingTask);
export type PickingTaskDocument = PickingTask & Document;

// 索引
PickingTaskSchema.index({ warehouseId: 1, status: 1 });
PickingTaskSchema.index({ method: 1, status: 1 });
PickingTaskSchema.index({ waveNo: 1 });
PickingTaskSchema.index({ assignedTo: 1, status: 1 });
PickingTaskSchema.index({ createdAt: -1 });
