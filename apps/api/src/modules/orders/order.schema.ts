import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;
import { OrderStatus, OrderPriority, TemperatureZone } from '@med/shared-types';
export { OrderStatus, OrderPriority, TemperatureZone };

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Order extends Document {
  @Prop({ required: true, unique: true, index: true })
  orderNo: string;

  @Prop({ type: String, ref: 'Customer', required: true, index: true })
  customerId: string;

  @Prop({ type: String, ref: 'Warehouse', required: true, index: true })
  warehouseId: string;

  @Prop({ type: [Object], required: true })
  items: {
    sku: string;
    inventoryId: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];

  @Prop({ required: true, enum: Object.values(OrderPriority), default: OrderPriority.NORMAL })
  priority: OrderPriority;

  @Prop({ required: true, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ type: Object, required: true })
  requestedDeliveryWindow: {
    start: Date;
    end: Date;
  };

  @Prop({ type: Date })
  actualDeliveryTime?: Date;

  @Prop({ required: true, min: 0 })
  totalWeight: number; // kg

  @Prop({ required: true, min: 0 })
  totalVolume: number; // m³

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: [String], required: true })
  temperatureRequirements: TemperatureZone[];

  @Prop()
  specialInstructions?: string;

  @Prop({ type: String, ref: 'DispatchTask' })
  dispatchId?: string;

  @Prop({ type: Object })
  shippingAddress: {
    province: string;
    city: string;
    district: string;
    detail: string;
    contactName: string;
    contactPhone: string;
    location?: { type: string; coordinates: number[] };
  };

  @Prop({ type: [Object], default: [] })
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    operator: string;
    remark?: string;
  }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ 'shippingAddress.location': '2dsphere' });
OrderSchema.index({ warehouseId: 1, status: 1 });
