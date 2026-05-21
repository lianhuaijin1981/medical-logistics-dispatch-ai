import {
  IsString, IsMongoId, IsArray, IsNumber, IsEnum,
  IsOptional, Min, Max, ValidateNested, ArrayMinSize, MaxLength, IsDateString, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PickingMethod, PickingStatus } from '../modules/picking/picking.enum';

// ---- Picking Item ----
export class PickingItemDto {
  @ApiProperty({ description: 'SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '订单号' })
  @IsString()
  orderNo: string;

  @ApiProperty({ description: '货位' })
  @IsString()
  location: string;

  @ApiProperty({ description: '应拣数量' })
  @IsNumber()
  @Min(1)
  pickQuantity: number;

  @ApiProperty({ description: '批号' })
  @IsString()
  batchNo: string;

  @ApiProperty({ description: '效期' })
  @IsDateString()
  expiryDate: string;
}

// ---- Create Picking DTO ----
export class CreatePickingDto {
  @ApiProperty({ description: '仓库 ID' })
  @IsMongoId()
  warehouseId: string;

  @ApiProperty({ description: '拣货方式', enum: PickingMethod, default: PickingMethod.WAVE })
  @IsEnum(PickingMethod)
  method: PickingMethod = PickingMethod.WAVE;

  @ApiProperty({ description: '订单 ID 列表', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  orderIds: string[];

  @ApiProperty({ description: '拣货明细', type: [PickingItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PickingItemDto)
  items: PickingItemDto[];

  @ApiPropertyOptional({ description: '指派人（用户 ID）' })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({ description: '库区编码' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zone?: string;

  @ApiPropertyOptional({ description: '优先级 0-10', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number = 0;

  @ApiPropertyOptional({ description: '波次号' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  waveNo?: string;
}

// ---- Update Picking DTO ----
export class UpdatePickingDto {
  @ApiPropertyOptional({ description: '拣货方式', enum: PickingMethod })
  @IsOptional()
  @IsEnum(PickingMethod)
  method?: PickingMethod;

  @ApiPropertyOptional({ description: '状态', enum: PickingStatus })
  @IsOptional()
  @IsEnum(PickingStatus)
  status?: PickingStatus;

  @ApiPropertyOptional({ description: '指派人' })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({ description: '库区编码' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zone?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number;

  @ApiPropertyOptional({ description: '取消原因' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cancelReason?: string;

  @ApiPropertyOptional({ description: '拣货明细' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickingItemDto)
  items?: PickingItemDto[];
}
