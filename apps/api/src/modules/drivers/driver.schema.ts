import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DriverStatus } from './driver.enum';
export { DriverStatus };

@Schema({ timestamps: true })
export class Driver extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, match: /^1[3-9]\d{9}$/ }) phone: string;
  @Prop({ required: true, unique: true }) licenseNumber: string;
  @Prop({ enum: DriverStatus, default: DriverStatus.AVAILABLE, index: true }) status: DriverStatus;
  @Prop() idCard?: string;
  @Prop({ type: [String], default: [] }) certifications: string[];
  @Prop({ type: Object }) currentLocation?: { type: string; coordinates: number[] };
  @Prop() currentVehicleId?: string;
  @Prop({ default: true }) enabled: boolean;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
export type DriverDocument = Driver & Document;
DriverSchema.index({ status: 1, enabled: 1 });
DriverSchema.index({ currentLocation: '2dsphere' });
