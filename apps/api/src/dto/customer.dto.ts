import {
  IsString, IsNumber, IsEnum, IsOptional, Min, Max,
  IsArray, ValidateNested, IsBoolean, IsEmail, MaxLength, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType } from '../modules/customers/customer.schema';

// ---- Address ----
export class CustomerAddressDto {
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

  @ApiPropertyOptional({ description: '邮编' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: '经纬度' })
  @IsOptional()
  location?: { type: string; coordinates: number[] };
}

// ---- Contact ----
export class CustomerContactDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  name: string;

  @ApiProperty({ description: '电话' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '角色' })
  @IsString()
  role: string;

  @ApiProperty({ description: '是否主联系人', default: true })
  @IsBoolean()
  isPrimary: boolean = true;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '微信' })
  @IsOptional()
  @IsString()
  wechat?: string;
}

// ---- Business License ----
export class BusinessLicenseDto {
  @ApiProperty({ description: '许可证编号' })
  @IsString()
  number: string;

  @ApiProperty({ description: '有效期' })
  @IsString()
  expiryDate: string;

  @ApiProperty({ description: '经营范围' })
  @IsString()
  scope: string;
}

// ---- Receiving Window ----
export class ReceivingWindowDto {
  @ApiProperty({ description: '收货日（0-6，0=周日）', example: [1, 2, 3, 4, 5] })
  @IsArray()
  @IsNumber({}, { each: true })
  weekdays: number[];

  @ApiProperty({ description: '开始时间 HH:mm', example: '08:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: '结束时间 HH:mm', example: '17:00' })
  @IsString()
  endTime: string;
}

// ---- Create Customer DTO ----
export class CreateCustomerDto {
  @ApiProperty({ description: '客户名称' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '客户编码' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: '客户类型', enum: CustomerType, default: CustomerType.HOSPITAL })
  @IsEnum(CustomerType)
  type: CustomerType = CustomerType.HOSPITAL;

  @ApiProperty({ description: '地址' })
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  address: CustomerAddressDto;

  @ApiProperty({ description: '联系人', type: [CustomerContactDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomerContactDto)
  contacts: CustomerContactDto[];

  @ApiPropertyOptional({ description: '信用等级 0-5', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  creditLevel?: number = 0;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;

  @ApiPropertyOptional({ description: '经营许可证' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessLicenseDto)
  businessLicense?: BusinessLicenseDto;

  @ApiPropertyOptional({ description: '常规温区要求', example: ['cold'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureRequirements?: string[];

  @ApiPropertyOptional({ description: '收货窗口' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReceivingWindowDto)
  receivingWindow?: ReceivingWindowDto;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

// ---- Update Customer DTO ----
export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '客户类型', enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddressDto)
  address?: CustomerAddressDto;

  @ApiPropertyOptional({ description: '联系人', type: [CustomerContactDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CustomerContactDto)
  contacts?: CustomerContactDto[];

  @ApiPropertyOptional({ description: '信用等级 0-5' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  creditLevel?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: '经营许可证' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessLicenseDto)
  businessLicense?: BusinessLicenseDto;

  @ApiPropertyOptional({ description: '常规温区要求' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  temperatureRequirements?: string[];

  @ApiPropertyOptional({ description: '收货窗口' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReceivingWindowDto)
  receivingWindow?: ReceivingWindowDto;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
