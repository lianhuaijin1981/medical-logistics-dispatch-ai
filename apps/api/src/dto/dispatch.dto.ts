import {
  IsString, IsMongoId, IsArray, IsNumber, IsEnum,
  IsOptional, Min, ValidateNested, ArrayMinSize, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DispatchStatus, DispatchPriority } from '../modules/dispatch/dispatch.enum';

// ---- Stop Address DTO (must be declared before RouteStopDto) ----
export class StopAddressDto {
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

  @ApiPropertyOptional({ description: '经纬度' })
  @IsOptional()
  location?: { type: string; coordinates: number[] };
}

// ---- Route Stop DTO ----
export class RouteStopDto {
  @ApiProperty({ description: '序号' })
  @IsNumber()
  @Min(0)
  sequence: number;

  @ApiProperty({ description: '订单 ID' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: '类型', enum: ['pickup', 'delivery'] })
  @IsEnum(['pickup', 'delivery'] as const)
  type: 'pickup' | 'delivery';

  @ApiProperty({ description: '地址' })
  @ValidateNested()
  @Type(() => StopAddressDto)
  address: StopAddressDto;

  @ApiProperty({ description: '预计到达时间' })
  @IsString()
  estimatedArrival: string;

  @ApiProperty({ description: '预计离开时间' })
  @IsString()
  estimatedDeparture: string;

  @ApiProperty({ description: '服务时长(秒)' })
  @IsNumber()
  @Min(0)
  serviceTime: number;

  @ApiProperty({ description: '距上站距离(m)' })
  @IsNumber()
  @Min(0)
  distanceFromPrev: number;
}

// ---- Route Plan Input DTO (must be declared before CreateDispatchDto) ----
export class RoutePlanInputDto {
  @ApiProperty({ description: '停靠站点', type: [RouteStopDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];

  @ApiProperty({ description: '总距离(m)' })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({ description: '总时长(秒)' })
  @IsNumber()
  @Min(0)
  totalDuration: number;

  @ApiProperty({ description: '算法' })
  @IsString()
  algorithm: string;

  @ApiProperty({ description: '是否考虑路况' })
  @IsOptional()
  trafficConsidered?: boolean = false;
}

// ---- Create Dispatch DTO ----
export class CreateDispatchDto {
  @ApiProperty({ description: '车辆 ID' })
  @IsMongoId()
  vehicleId: string;

  @ApiProperty({ description: '驾驶员 ID' })
  @IsMongoId()
  driverId: string;

  @ApiProperty({ description: '仓库 ID' })
  @IsMongoId()
  warehouseId: string;

  @ApiProperty({ description: '订单 ID 列表', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderIds: string[];

  @ApiPropertyOptional({ description: '优先级', enum: DispatchPriority, default: DispatchPriority.NORMAL })
  @IsOptional()
  @IsEnum(DispatchPriority)
  priority?: DispatchPriority = DispatchPriority.NORMAL;

  @ApiProperty({ description: '总重量(kg)' })
  @IsNumber()
  @Min(0)
  totalWeight: number;

  @ApiProperty({ description: '总体积(m³)' })
  @IsNumber()
  @Min(0)
  totalVolume: number;

  @ApiProperty({ description: '订单数量' })
  @IsNumber()
  @Min(1)
  orderCount: number;

  @ApiPropertyOptional({ description: '预估距离(m)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDistance?: number;

  @ApiPropertyOptional({ description: '预估时长(秒)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: '温区', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureZones?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: '路径规划', type: [RouteStopDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutePlanInputDto)
  route?: RoutePlanInputDto;
}

// ---- Update Dispatch DTO ----
export class UpdateDispatchDto {
  @ApiPropertyOptional({ description: '车辆 ID' })
  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @ApiPropertyOptional({ description: '驾驶员 ID' })
  @IsOptional()
  @IsMongoId()
  driverId?: string;

  @ApiPropertyOptional({ description: '仓库 ID' })
  @IsOptional()
  @IsMongoId()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '订单 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderIds?: string[];

  @ApiPropertyOptional({ description: '优先级', enum: DispatchPriority })
  @IsOptional()
  @IsEnum(DispatchPriority)
  priority?: DispatchPriority;

  @ApiPropertyOptional({ description: '状态', enum: DispatchStatus })
  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

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

  @ApiPropertyOptional({ description: '订单数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderCount?: number;

  @ApiPropertyOptional({ description: '预估距离(m)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDistance?: number;

  @ApiPropertyOptional({ description: '预估时长(秒)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: '发车时间' })
  @IsOptional()
  @IsString()
  departureTime?: string;

  @ApiPropertyOptional({ description: '到达时间' })
  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @ApiPropertyOptional({ description: '实际距离(m)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDistance?: number;

  @ApiPropertyOptional({ description: '实际时长(秒)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDuration?: number;

  @ApiPropertyOptional({ description: '温区' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureZones?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// ---- Update Dispatch Status DTO ----
export class UpdateDispatchStatusDto {
  @ApiProperty({ description: '新状态', enum: DispatchStatus })
  @IsEnum(DispatchStatus)
  status: DispatchStatus;

  @ApiPropertyOptional({ description: '操作人' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
