import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum InventoryClass {
  A = 'A', // 高价值/高周转
  B = 'B', // 中等
  C = 'C', // 低价值/低周转
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class InventoryItem extends Document {
  @Prop({ required: true, index: true })
  sku: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  specification: string;

  @Prop({ required: true })
  manufacturer: string;

  @Prop({ required: true })
  approvalNumber: string; // 国药准字

  @Prop({ required: true, index: true })
  batchNo: string;

  @Prop({ required: true, type: Date, index: true })
  expiryDate: Date;

  @Prop({ required: true, enum: ['ambient', 'cool', 'cold', 'frozen'] })
  temperatureZone: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  lockedQuantity: number;

  @Prop({ type: String, ref: 'Warehouse', required: true, index: true })
  warehouseId: string;

  @Prop({ required: true })
  location: string; // 货位编码

  @Prop({ enum: ['A', 'B', 'C'], index: true })
  abcClass: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 0, min: 0 })
  safetyStock: number;

  @Prop({ default: 999999, min: 0 })
  maxStock: number;

  @Prop({ default: 0, min: 0 })
  minStock: number;
}

export const InventorySchema = SchemaFactory.createForClass(InventoryItem);
export const InventoryItemSchema = InventorySchema;
export type InventoryItemDocument = InventoryItem & Document;

InventorySchema.index({ sku: 1, warehouseId: 1, batchNo: 1 }, { unique: true });
InventorySchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 }); // TTL index for expiry
InventorySchema.index({ quantity: 1, safetyStock: 1 });
InventorySchema.index({ abcClass: 1, warehouseId: 1 });
