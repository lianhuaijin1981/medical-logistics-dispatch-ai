import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  DRIVER = 'driver',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  realName: string;

  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.OPERATOR })
  role: UserRole;

  @Prop({ required: true, match: /^1[3-9]\d{9}$/ })
  phone: string;

  @Prop({ type: String, ref: 'Warehouse', required: false })
  warehouseId?: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;

// 索引
UserSchema.index({ role: 1, enabled: 1 });
UserSchema.index({ warehouseId: 1 });

// 虚拟字段
UserSchema.virtual('warehouse', {
  ref: 'Warehouse',
  localField: 'warehouseId',
  foreignField: '_id',
  justOne: true,
});
