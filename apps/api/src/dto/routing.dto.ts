import {
  IsString, IsMongoId, IsArray, IsNumber, IsEnum,
  IsOptional, Min, Max, ValidateNested, ArrayMinSize, IsBoolean, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteAlgorithm } from '../modules/routing/routing.schema';

// ---- Route Address (must be declared before RoutePlanStopDto) ----
export class RouteAddressDto {
  @IsString() province: string;
  @IsString() city: string;
  @IsString() district: string;
  @IsString() detail: string;
  @IsString() contactName: string;
  @IsString() contactPhone: string;
  @IsOptional() location?: { type: string; coordinates: number[] };
}

// ---- Route Stop ----
export class RoutePlanStopDto {
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
  @Type(() => RouteAddressDto)
  address: RouteAddressDto;

  @ApiProperty({ description: '预计到达' })
  @IsDateString()
  estimatedArrival: string;

  @ApiProperty({ description: '预计离开' })
  @IsDateString()
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

// ---- Create Route DTO ----
export class CreateRouteDto {
  @ApiProperty({ description: '调度任务 ID' })
  @IsMongoId()
  dispatchId: string;

  @ApiProperty({ description: '车辆 ID' })
  @IsMongoId()
  vehicleId: string;

  @ApiProperty({ description: '停靠站点', type: [RoutePlanStopDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutePlanStopDto)
  stops: RoutePlanStopDto[];

  @ApiProperty({ description: '总距离(m)' })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({ description: '总时长(秒)' })
  @IsNumber()
  @Min(0)
  totalDuration: number;

  @ApiPropertyOptional({ description: '路径几何坐标' })
  @IsOptional()
  geometry?: { type: string; coordinates: number[][] };

  @ApiProperty({ description: '算法', enum: RouteAlgorithm })
  @IsEnum(RouteAlgorithm)
  algorithm: RouteAlgorithm;

  @ApiPropertyOptional({ description: '是否考虑路况', default: false })
  @IsOptional()
  @IsBoolean()
  trafficConsidered?: boolean = false;
}

// ---- Update Route DTO ----
export class UpdateRouteDto {
  @ApiPropertyOptional({ description: '停靠站点', type: [RoutePlanStopDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutePlanStopDto)
  stops?: RoutePlanStopDto[];

  @ApiPropertyOptional({ description: '总距离(m)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDistance?: number;

  @ApiPropertyOptional({ description: '总时长(秒)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDuration?: number;

  @ApiPropertyOptional({ description: '路径几何' })
  @IsOptional()
  geometry?: { type: string; coordinates: number[][] };

  @ApiPropertyOptional({ description: '算法', enum: RouteAlgorithm })
  @IsOptional()
  @IsEnum(RouteAlgorithm)
  algorithm?: RouteAlgorithm;

  @ApiPropertyOptional({ description: '是否考虑路况' })
  @IsOptional()
  @IsBoolean()
  trafficConsidered?: boolean;

  @ApiPropertyOptional({ description: '计算耗时(ms)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  computationTime?: number;

  @ApiPropertyOptional({ description: '路况对比' })
  @IsOptional()
  trafficComparison?: {
    noTraffic: { distance: number; duration: number };
    withTraffic: { distance: number; duration: number };
    trafficRatio: number;
  };
}
