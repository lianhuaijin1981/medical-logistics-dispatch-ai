import {
  IsString, IsNumber, IsEnum, IsOptional, Min, Max,
  IsArray, IsBoolean, ValidateNested, IsMongoId, MaxLength, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, VehicleStatus } from '../modules/vehicles/vehicle.enum';

// ---- Create Vehicle DTO ----
export class CreateVehicleDto {
  @ApiProperty({ description: '车牌号', example: '京A12345' })
  @IsString()
  @MaxLength(10)
  @Matches(/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-Z0-9]{4,5}[A-Z0-9挂学警]$/)
  plateNumber: string;

  @ApiProperty({ description: '品牌', example: '东风' })
  @IsString()
  @MaxLength(50)
  brand: string;

  @ApiProperty({ description: '车型', example: '天龙KL' })
  @IsString()
  @MaxLength(100)
  vehicleModel: string;

  @ApiProperty({ description: '车辆类型', enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ description: '温区', example: ['ambient', 'cold'] })
  @IsArray()
  @IsString({ each: true })
  temperatureZones: string[];

  @ApiProperty({ description: '载货容量(m³)' })
  @IsNumber()
  @Min(0)
  capacity: number;

  @ApiProperty({ description: '最大载重(kg)' })
  @IsNumber()
  @Min(0)
  maxWeight: number;

  @ApiPropertyOptional({ description: '当前所在仓库 ID' })
  @IsOptional()
  @IsMongoId()
  currentWarehouseId?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}

// ---- Update Vehicle DTO ----
export class UpdateVehicleDto {
  @ApiPropertyOptional({ description: '品牌' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @ApiPropertyOptional({ description: '车型' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehicleModel?: string;

  @ApiPropertyOptional({ description: '车辆类型', enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @ApiPropertyOptional({ description: '温区' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureZones?: string[];

  @ApiPropertyOptional({ description: '载货容量(m³)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ description: '最大载重(kg)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @ApiPropertyOptional({ description: '状态', enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ description: '当前位置' })
  @IsOptional()
  currentLocation?: { type: string; coordinates: number[] };

  @ApiPropertyOptional({ description: '当前驾驶员 ID' })
  @IsOptional()
  @IsMongoId()
  currentDriverId?: string;

  @ApiPropertyOptional({ description: '当前所在仓库 ID' })
  @IsOptional()
  @IsMongoId()
  currentWarehouseId?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
