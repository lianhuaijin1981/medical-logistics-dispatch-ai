import {
  IsString, IsMongoId, IsNumber, IsEnum, IsOptional, Min,
  IsDateString, IsIn, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ---- Create Inventory DTO ----
export class CreateInventoryDto {
  @ApiProperty({ description: 'SKU 编码' })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '品类' })
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: '规格' })
  @IsString()
  @MaxLength(100)
  specification: string;

  @ApiProperty({ description: '生产厂家' })
  @IsString()
  @MaxLength(200)
  manufacturer: string;

  @ApiProperty({ description: '批准文号（国药准字）' })
  @IsString()
  @MaxLength(50)
  approvalNumber: string;

  @ApiProperty({ description: '批号' })
  @IsString()
  @MaxLength(50)
  batchNo: string;

  @ApiProperty({ description: '效期' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: '温区', enum: ['ambient', 'cool', 'cold', 'frozen'] })
  @IsIn(['ambient', 'cool', 'cold', 'frozen'])
  temperatureZone: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: '锁定数量', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lockedQuantity?: number = 0;

  @ApiProperty({ description: '仓库 ID' })
  @IsMongoId()
  warehouseId: string;

  @ApiProperty({ description: '货位编码' })
  @IsString()
  @MaxLength(20)
  location: string;

  @ApiProperty({ description: 'ABC 分类', enum: ['A', 'B', 'C'] })
  @IsIn(['A', 'B', 'C'])
  abcClass: string;

  @ApiProperty({ description: '单位（盒/瓶/支/箱）' })
  @IsString()
  @MaxLength(10)
  unit: string;

  @ApiProperty({ description: '单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: '安全库存', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number = 0;

  @ApiPropertyOptional({ description: '最大库存', default: 999999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number = 999999;

  @ApiPropertyOptional({ description: '最小库存', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number = 0;
}

// ---- Update Inventory DTO ----
export class UpdateInventoryDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '品类' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  specification?: string;

  @ApiPropertyOptional({ description: '生产厂家' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  manufacturer?: string;

  @ApiPropertyOptional({ description: '批准文号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvalNumber?: string;

  @ApiPropertyOptional({ description: '批号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNo?: string;

  @ApiPropertyOptional({ description: '效期' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '温区' })
  @IsOptional()
  @IsIn(['ambient', 'cool', 'cold', 'frozen'])
  temperatureZone?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: '锁定数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lockedQuantity?: number;

  @ApiPropertyOptional({ description: '仓库 ID' })
  @IsOptional()
  @IsMongoId()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '货位编码' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  location?: string;

  @ApiPropertyOptional({ description: 'ABC 分类' })
  @IsOptional()
  @IsIn(['A', 'B', 'C'])
  abcClass?: string;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unit?: string;

  @ApiPropertyOptional({ description: '单价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: '安全库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @ApiPropertyOptional({ description: '最大库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: '最小库存' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;
}
