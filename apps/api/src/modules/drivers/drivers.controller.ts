import { Controller, Get, Post, Body, Param, Query, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverStatus } from './driver.schema';
import { CreateDriverDto, UpdateDriverDto } from '../../dto/driver.dto';

@ApiTags('drivers')
@Controller('drivers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DriversController {
  constructor(private readonly service: DriversService) {}

  @Get()
  @ApiOperation({ summary: '获取司机列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用司机（调度分配用）' })
  findAvailable() {
    return this.service.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取司机详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增司机' })
  create(@Body() dto: CreateDriverDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新司机信息' })
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新司机状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: DriverStatus,
    @Body('vehicleId') vehicleId?: string,
  ) {
    return this.service.updateStatus(id, status, vehicleId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除司机' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
