import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum WarehouseType {
  CENTRAL = 'central',
  REGIONAL = 'regional',
  TRANSIT = 'transit',
  COLD_CHAIN = 'cold_chain',
}

export enum TemperatureZone {
  AMBIENT = 'ambient',
  COOL = 'cool',
  COLD = 'cold',
  FROZEN = 'frozen',
}

@Schema({ timestamps: true })
export class Warehouse extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(WarehouseType) })
  type: WarehouseType;

  @Prop({ type: Object, required: true })
  address: {
    province: string;
    city: string;
    district: string;
    detail: string;
    location?: { type: string; coordinates: number[] };
  };

  @Prop({ required: true, min: 0 })
  capacity: number; // m³

  @Prop({ type: [String], required: true })
  temperatureZones: TemperatureZone[];

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: Object })
  contact?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);

WarehouseSchema.index({ type: 1, enabled: 1 });
WarehouseSchema.index({ 'address.location': '2dsphere' });
