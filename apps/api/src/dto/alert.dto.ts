import {
  IsString, IsMongoId, IsBoolean, IsEnum, IsOptional, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertLevel, AlertType } from '../modules/alerts/alert.enum';

// ---- Create Alert DTO ----
export class CreateAlertDto {
  @ApiProperty({ description: '告警级别', enum: AlertLevel })
  @IsEnum(AlertLevel)
  level: AlertLevel;

  @ApiProperty({ description: '告警类型', enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({ description: '告警标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '告警详情' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({ description: '关联订单 ID' })
  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @ApiPropertyOptional({ description: '关联车辆 ID' })
  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @ApiPropertyOptional({ description: '关联库存 ID' })
  @IsOptional()
  @IsMongoId()
  inventoryId?: string;

  @ApiPropertyOptional({ description: '关联仓库 ID' })
  @IsOptional()
  @IsMongoId()
  warehouseId?: string;
}

// ---- Update Alert DTO ----
export class UpdateAlertDto {
  @ApiPropertyOptional({ description: '新消息内容' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @ApiPropertyOptional({ description: '是否已解决' })
  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @ApiPropertyOptional({ description: '解决人' })
  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @ApiPropertyOptional({ description: '解决备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionNote?: string;
}
