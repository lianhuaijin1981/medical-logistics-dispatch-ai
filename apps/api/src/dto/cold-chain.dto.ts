import {
  IsString, IsMongoId, IsNumber, IsBoolean, IsArray, IsEnum,
  IsOptional, Min, Max, ValidateNested, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemperatureZone, ColdChainAlertStatus } from '../modules/cold-chain/cold-chain.schema';

// ---- Range Limit Object ----
class RangeLimitDto {
  @ApiProperty({ description: '最低温度' })
  @IsNumber()
  min: number;

  @ApiProperty({ description: '最高温度' })
  @IsNumber()
  max: number;

  @ApiProperty({ description: '单位', default: '°C' })
  @IsString()
  unit: string = '°C';
}

// ---- Sensor Object ----
class SensorDto {
  @ApiProperty({ description: '传感器 ID' })
  @IsString()
  sensorId: string;

  @ApiProperty({ description: '传感器位置' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ description: '上次校准时间' })
  @IsOptional()
  @IsDateString()
  lastCalibratedAt?: string;
}

// ---- Create ColdChain Record DTO ----
export class CreateColdChainRecordDto {
  @ApiProperty({ description: '调度任务 ID' })
  @IsMongoId()
  dispatchId: string;

  @ApiProperty({ description: '车辆 ID' })
  @IsMongoId()
  vehicleId: string;

  @ApiProperty({ description: '订单 ID 列表', type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  orderIds: string[];

  @ApiProperty({ description: '时间戳' })
  @IsString()
  timestamp: string;

  @ApiProperty({ description: '温度 (°C)' })
  @IsNumber()
  temperature: number;

  @ApiPropertyOptional({ description: '湿度 (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiProperty({ description: '温区', enum: TemperatureZone })
  @IsEnum(TemperatureZone)
  zone: TemperatureZone;

  @ApiProperty({ description: '温区范围', type: RangeLimitDto })
  @ValidateNested()
  @Type(() => RangeLimitDto)
  rangeLimit: RangeLimitDto;

  @ApiProperty({ description: '是否在范围内' })
  @IsBoolean()
  withinRange: boolean;

  @ApiProperty({ description: '告警状态', enum: ColdChainAlertStatus, default: ColdChainAlertStatus.NORMAL })
  @IsEnum(ColdChainAlertStatus)
  alertStatus: ColdChainAlertStatus = ColdChainAlertStatus.NORMAL;

  @ApiPropertyOptional({ description: '是否已生成告警' })
  @IsOptional()
  @IsBoolean()
  alertGenerated?: boolean = false;

  @ApiPropertyOptional({ description: '关联告警 ID' })
  @IsOptional()
  @IsMongoId()
  alertId?: string;

  @ApiPropertyOptional({ description: '传感器信息', type: SensorDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SensorDto)
  sensor?: SensorDto;

  @ApiPropertyOptional({ description: '冷链设备 ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ description: '开门次数' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  doorOpenCount?: number;

  @ApiPropertyOptional({ description: '压缩机运行时长 (分钟)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compressorRuntime?: number;
}

// ---- Query ColdChain Record DTO ----
export class QueryColdChainRecordDto {
  @ApiPropertyOptional({ description: '调度任务 ID' })
  @IsOptional()
  @IsMongoId()
  dispatchId?: string;

  @ApiPropertyOptional({ description: '车辆 ID' })
  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @ApiPropertyOptional({ description: '温区', enum: TemperatureZone })
  @IsOptional()
  @IsEnum(TemperatureZone)
  zone?: TemperatureZone;

  @ApiPropertyOptional({ description: '是否在范围内' })
  @IsOptional()
  @IsBoolean()
  withinRange?: boolean;

  @ApiPropertyOptional({ description: '告警状态', enum: ColdChainAlertStatus })
  @IsOptional()
  @IsEnum(ColdChainAlertStatus)
  alertStatus?: ColdChainAlertStatus;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页条数', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 50;
}
