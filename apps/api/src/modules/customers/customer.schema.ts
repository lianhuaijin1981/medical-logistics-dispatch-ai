import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CustomerType {
  HOSPITAL = 'hospital',       // 医院
  PHARMACY = 'pharmacy',       // 药房
  CLINIC = 'clinic',           // 诊所
  DISTRIBUTOR = 'distributor', // 经销商
  OTHER = 'other',             // 其他
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Customer extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string; // 客户编码

  @Prop({ required: true, enum: Object.values(CustomerType), default: CustomerType.HOSPITAL, index: true })
  type: CustomerType;

  @Prop({ type: Object, required: true })
  address: {
    province: string;
    city: string;
    district: string;
    detail: string;
    postalCode?: string;
    location?: { type: string; coordinates: number[] };
  };

  @Prop({ type: [Object], required: true })
  contacts: {
    name: string;
    phone: string;
    role: string;
    isPrimary: boolean;
    email?: string;
    wechat?: string;
  }[];

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  creditLevel: number; // 信用等级 0-5

  @Prop({ type: Number, default: 0 })
  ordersCount: number; // 累计订单数

  @Prop({ type: Number, default: 0 })
  totalAmount: number; // 累计金额

  @Prop({ default: true })
  enabled: boolean; // 是否启用

  @Prop({ type: Object })
  businessLicense?: {
    number: string;
    expiryDate: Date;
    scope: string; // 经营范围
  };

  @Prop({ type: Object })
  qualityCert?: {
    gsp?: boolean;  // GSP 认证
    gmp?: boolean;  // GMP 认证
    other?: string[];
  };

  @Prop({ type: [String] })
  temperatureRequirements?: string[]; // 该客户常规温区要求

  @Prop({ type: Object })
  receivingWindow?: {
    weekdays: number[]; // 0=周日, 1=周一...6=周六
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
  };

  @Prop({ type: String })
  remark?: string;

  @Prop({ type: [Object], default: [] })
  tags: {
    label: string;
    color?: string;
  }[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
export type CustomerDocument = Customer & Document;

// 索引
CustomerSchema.index({ type: 1, enabled: 1 });
CustomerSchema.index({ name: 'text' });
CustomerSchema.index({ 'address.location': '2dsphere' });
CustomerSchema.index({ creditLevel: 1 });
CustomerSchema.index({ code: 1 });
