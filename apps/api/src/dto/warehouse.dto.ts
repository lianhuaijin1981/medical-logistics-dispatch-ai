import {
  IsString, IsNumber, IsEnum, IsOptional, Min,
  IsArray, IsBoolean, IsEmail, ValidateNested, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarehouseType, TemperatureZone } from '../modules/warehouses/warehouse.schema';

// ---- Address sub-DTO ----
export class WarehouseAddressDto {
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

  @ApiPropertyOptional({ description: '经纬度', example: { type: 'Point', coordinates: [116.4, 39.9] } })
  @IsOptional()
  location?: { type: string; coordinates: number[] };
}

// ---- Contact sub-DTO ----
export class WarehouseContactDto {
  @ApiProperty({ description: '联系人姓名' })
  @IsString()
  name: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

// ---- Create Warehouse DTO ----
export class CreateWarehouseDto {
  @ApiProperty({ description: '仓库编码' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: '仓库名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '仓库类型', enum: WarehouseType })
  @IsEnum(WarehouseType)
  type: WarehouseType;

  @ApiProperty({ description: '仓库地址' })
  @ValidateNested()
  @Type(() => WarehouseAddressDto)
  address: WarehouseAddressDto;

  @ApiProperty({ description: '库容(m³)' })
  @IsNumber()
  @Min(0)
  capacity: number;

  @ApiProperty({ description: '温区', enum: TemperatureZone, isArray: true })
  @IsArray()
  @IsString({ each: true })
  temperatureZones: string[];

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;

  @ApiPropertyOptional({ description: '联系人信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WarehouseContactDto)
  contact?: WarehouseContactDto;
}

// ---- Update Warehouse DTO ----
export class UpdateWarehouseDto {
  @ApiPropertyOptional({ description: '仓库名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '仓库类型', enum: WarehouseType })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({ description: '仓库地址' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WarehouseAddressDto)
  address?: WarehouseAddressDto;

  @ApiPropertyOptional({ description: '库容(m³)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ description: '温区', enum: TemperatureZone, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureZones?: string[];

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '联系人信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WarehouseContactDto)
  contact?: WarehouseContactDto;
}
