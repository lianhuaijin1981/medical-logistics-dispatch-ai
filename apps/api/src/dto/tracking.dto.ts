import {
  IsString, IsMongoId, IsNumber, IsArray, IsOptional,
  Min, Max, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ---- Location Object ----
class LocationDto {
  @ApiProperty({ description: 'GeoJSON 类型', enum: ['Point'] })
  @IsString()
  type: 'Point';

  @ApiProperty({ description: '经纬度 [longitude, latitude]', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];
}

// ---- Address Object ----
class AddressDto {
  @ApiProperty({ description: '格式化地址' })
  @IsString()
  formattedAddress: string;

  @ApiProperty({ description: '省' })
  @IsString()
  province: string;

  @ApiProperty({ description: '市' })
  @IsString()
  city: string;

  @ApiProperty({ description: '区' })
  @IsString()
  district: string;

  @ApiProperty({ description: '街道' })
  @IsString()
  street: string;

  @ApiProperty({ description: '门牌号' })
  @IsString()
  number: string;
}

// ---- Create GPS Track DTO ----
export class CreateGPSTrackDto {
  @ApiProperty({ description: '车辆 ID' })
  @IsMongoId()
  vehicleId: string;

  @ApiProperty({ description: '调度任务 ID' })
  @IsMongoId()
  dispatchId: string;

  @ApiPropertyOptional({ description: '驾驶员 ID' })
  @IsOptional()
  @IsMongoId()
  driverId?: string;

  @ApiProperty({ description: '时间戳' })
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'GPS 位置', type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: '速度 (km/h)' })
  @IsNumber()
  @Min(0)
  speed: number;

  @ApiProperty({ description: '航向角 (度, 0-360)' })
  @IsNumber()
  @Min(0)
  @Max(360)
  heading: number;

  @ApiPropertyOptional({ description: 'GPS 精度 (米)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ description: '海拔 (米)' })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({ description: '设备电量 (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'GPS 信号强度' })
  @IsOptional()
  @IsNumber()
  signalStrength?: number;

  @ApiPropertyOptional({ description: '累积里程 (米)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cumulativeDistance?: number;

  @ApiPropertyOptional({ description: '地址反解析', type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

// ---- Query GPS Track DTO ----
export class QueryGPSTrackDto {
  @ApiPropertyOptional({ description: '车辆 ID' })
  @IsOptional()
  @IsMongoId()
  vehicleId?: string;

  @ApiPropertyOptional({ description: '调度任务 ID' })
  @IsOptional()
  @IsMongoId()
  dispatchId?: string;

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
