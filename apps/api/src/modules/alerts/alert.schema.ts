import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AlertLevel, AlertType } from './alert.enum';

@Schema({ timestamps: true })
export class Alert extends Document {
  @Prop({ required: true, enum: AlertLevel, index: true }) level: AlertLevel;
  @Prop({ required: true, enum: AlertType }) type: AlertType;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) message: string;
  @Prop({ type: String, ref: 'Order' }) orderId?: string;
  @Prop({ type: String, ref: 'Vehicle' }) vehicleId?: string;
  @Prop({ type: String, ref: 'InventoryItem' }) inventoryId?: string;
  @Prop({ type: String, ref: 'Warehouse' }) warehouseId?: string;
  @Prop({ default: false, index: true }) resolved: boolean;
  @Prop() resolvedAt?: Date;
  @Prop() resolvedBy?: string;
  @Prop() resolutionNote?: string;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
export type AlertDocument = Alert & Document;

// Re-export enums
export { AlertLevel, AlertType } from './alert.enum';
AlertSchema.index({ level: 1, resolved: 1 });
AlertSchema.index({ createdAt: -1 });
