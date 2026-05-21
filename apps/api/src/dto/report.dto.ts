import {
  IsString, IsMongoId, IsNumber, IsBoolean, IsArray, IsEnum,
  IsOptional, Min, MaxLength, ValidateNested, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, ReportStatus, ReportPeriodType, ReportFormat } from '../modules/reports/report.enum';

// ---- DateRange Object ----
class DateRangeDto {
  @ApiProperty({ description: '开始日期' })
  @IsDateString()
  start: string;

  @ApiProperty({ description: '结束日期' })
  @IsDateString()
  end: string;
}

// ---- File Storage Object ----
class ReportFileDto {
  @ApiProperty({ description: '存储后端', enum: ['local', 'minio', 'cos'] })
  @IsEnum(['local', 'minio', 'cos'] as const)
  storage: 'local' | 'minio' | 'cos';

  @ApiProperty({ description: '存储桶' })
  @IsString()
  bucket: string;

  @ApiProperty({ description: '对象 key' })
  @IsString()
  key: string;

  @ApiProperty({ description: '访问 URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: '文件大小 (bytes)' })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiPropertyOptional({ description: 'MD5 校验' })
  @IsOptional()
  @IsString()
  md5?: string;
}

// ---- Schedule Config Object ----
class ScheduleConfigDto {
  @ApiProperty({ description: '是否启用定时' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Cron 表达式' })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ description: '邮件接收人' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: '企微接收人' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wechatRecipients?: string[];

  @ApiPropertyOptional({ description: '下次运行时间' })
  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @ApiPropertyOptional({ description: '上次运行时间' })
  @IsOptional()
  @IsDateString()
  lastRunAt?: string;
}

// ---- Create Report DTO ----
export class CreateReportDto {
  @ApiProperty({ description: '报表标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '报表类型', enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: '报表周期', enum: ReportPeriodType, default: ReportPeriodType.DAILY })
  @IsEnum(ReportPeriodType)
  periodType: ReportPeriodType = ReportPeriodType.DAILY;

  @ApiProperty({ description: '日期范围', type: DateRangeDto })
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange: DateRangeDto;

  @ApiProperty({ description: '输出格式', enum: ReportFormat, default: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  format: ReportFormat = ReportFormat.PDF;

  @ApiPropertyOptional({ description: '仓库 ID' })
  @IsOptional()
  @IsMongoId()
  warehouseId?: string;

  @ApiPropertyOptional({ description: '车辆 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  vehicleIds?: string[];

  @ApiPropertyOptional({ description: '驾驶员 ID 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  driverIds?: string[];

  @ApiPropertyOptional({ description: '调度配置', type: ScheduleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleConfigDto)
  schedule?: ScheduleConfigDto;
}

// ---- Update Report DTO ----
export class UpdateReportDto {
  @ApiPropertyOptional({ description: '报表标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '报表状态', enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ description: '格式', enum: ReportFormat })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({ description: '文件信息', type: ReportFileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReportFileDto)
  file?: ReportFileDto;

  @ApiPropertyOptional({ description: '调度配置', type: ScheduleConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleConfigDto)
  schedule?: ScheduleConfigDto;
}
