import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VehicleType, VehicleStatus } from '../vehicles/vehicle.enum';
export { VehicleType, VehicleStatus };

@Schema({ timestamps: true })
export class Vehicle extends Document {
  @Prop({ required: true, unique: true, index: true }) plateNumber: string;
  @Prop({ required: true }) brand: string;
  @Prop({ required: true }) vehicleModel: string;
  @Prop({ enum: VehicleType, required: true }) type: VehicleType;
  @Prop({ enum: VehicleStatus, default: VehicleStatus.AVAILABLE, index: true }) status: VehicleStatus;
  @Prop({ type: [String], required: true }) temperatureZones: string[];
  @Prop({ required: true, min: 0 }) capacity: number;
  @Prop({ required: true, min: 0 }) maxWeight: number;
  @Prop({ type: Object }) currentLocation?: { type: string; coordinates: number[] };
  @Prop() currentDriverId?: string;
  @Prop() currentWarehouseId?: string;
  @Prop({ default: true }) enabled: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
export type VehicleDocument = Vehicle & Document;
VehicleSchema.index({ status: 1, enabled: 1 });
VehicleSchema.index({ type: 1 });
VehicleSchema.index({ currentLocation: '2dsphere' });
