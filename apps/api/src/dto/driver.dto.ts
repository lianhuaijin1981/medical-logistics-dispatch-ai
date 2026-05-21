import {
  IsString, IsEnum, IsOptional, IsBoolean, IsMongoId,
  MaxLength, Matches, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../modules/drivers/driver.enum';

// ---- Create Driver DTO ----
export class CreateDriverDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone: string;

  @ApiProperty({ description: '驾照号' })
  @IsString()
  @MaxLength(30)
  licenseNumber: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  idCard?: string;

  @ApiPropertyOptional({ description: '资质证书', example: ['冷链运输', '危险品运输'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}

// ---- Update Driver DTO ----
export class UpdateDriverDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string;

  @ApiPropertyOptional({ description: '驾照号' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  idCard?: string;

  @ApiPropertyOptional({ description: '资质证书' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ description: '状态', enum: DriverStatus })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiPropertyOptional({ description: '当前位置' })
  @IsOptional()
  currentLocation?: { type: string; coordinates: number[] };

  @ApiPropertyOptional({ description: '当前车辆 ID' })
  @IsOptional()
  @IsMongoId()
  currentVehicleId?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
