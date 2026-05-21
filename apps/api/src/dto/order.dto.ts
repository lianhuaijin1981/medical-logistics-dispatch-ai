import {
  IsString, IsMongoId, IsArray, IsNumber, IsDateString, IsEnum,
  IsOptional, Min, ValidateNested, MaxLength, ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderPriority, OrderStatus } from '@med/shared-types';

// ---- Order Item ----
export class OrderItemDto {
  @ApiProperty({ description: 'SKU 编码' })
  @IsString()
  sku: string;

  @ApiProperty({ description: '库存记录 ID' })
  @IsMongoId()
  inventoryId: string;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: '单位' })
  @IsString()
  unit: string;

  @ApiProperty({ description: '单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

// ---- Shipping Address ----
export class ShippingAddressDto {
  @ApiProperty({ description: '省' })
  @IsString()
  province: string;

  @ApiProperty({ description: '市' })
  @IsString()
  city: string;

  @ApiProperty({ description: '区' })
  @IsString()
  district: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  detail: string;

  @ApiProperty({ description: '联系人' })
  @IsString()
  contactName: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional({ description: '经纬度', example: { type: 'Point', coordinates: [116.4, 39.9] } })
  @IsOptional()
  location?: { type: string; coordinates: number[] };
}

// ---- Delivery Window ----
export class DeliveryWindowDto {
  @ApiProperty({ description: '配送开始时间' })
  @IsDateString()
  start: string;

  @ApiProperty({ description: '配送结束时间' })
  @IsDateString()
  end: string;
}

// ---- Create Order DTO ----
export class CreateOrderDto {
  @ApiProperty({ description: '客户 ID' })
  @IsMongoId()
  customerId: string;

  @ApiProperty({ description: '发货仓库 ID' })
  @IsMongoId()
  warehouseId: string;

  @ApiProperty({ description: '订单商品明细', type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: '优先级', enum: OrderPriority, default: OrderPriority.NORMAL })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority = OrderPriority.NORMAL;

  @ApiProperty({ description: '要求配送时间窗口' })
  @ValidateNested()
  @Type(() => DeliveryWindowDto)
  requestedDeliveryWindow: DeliveryWindowDto;

  @ApiProperty({ description: '总重量(kg)' })
  @IsNumber()
  @Min(0)
  totalWeight: number;

  @ApiProperty({ description: '总体积(m³)' })
  @IsNumber()
  @Min(0)
  totalVolume: number;

  @ApiProperty({ description: '总金额' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: '温区要求', example: ['cold'] })
  @IsArray()
  @IsString({ each: true })
  temperatureRequirements: string[];

  @ApiPropertyOptional({ description: '特殊要求说明' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialInstructions?: string;

  @ApiProperty({ description: '收货地址' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}

// ---- Update Order DTO ----
export class UpdateOrderDto {
  @ApiPropertyOptional({ description: '客户 ID' })
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @ApiPropertyOptional({ description: '发货仓库 ID' })
  @IsOptional()
  @IsMongoId()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '订单商品明细', type: [OrderItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiPropertyOptional({ description: '优先级', enum: OrderPriority })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiPropertyOptional({ description: '状态', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: '要求配送时间窗口' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryWindowDto)
  requestedDeliveryWindow?: DeliveryWindowDto;

  @ApiPropertyOptional({ description: '总重量(kg)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWeight?: number;

  @ApiPropertyOptional({ description: '总体积(m³)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVolume?: number;

  @ApiPropertyOptional({ description: '总金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: '温区要求' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureRequirements?: string[];

  @ApiPropertyOptional({ description: '特殊要求说明' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialInstructions?: string;

  @ApiPropertyOptional({ description: '收货地址' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({ description: '调度任务 ID' })
  @IsOptional()
  @IsMongoId()
  dispatchId?: string;
}
