import { Controller, Get, Post, Body, Param, Query, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VehicleStatus } from './vehicle.schema';
import { CreateVehicleDto, UpdateVehicleDto } from '../../dto/vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: '获取车辆列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可用车辆（调度选车用）' })
  findAvailable(@Query('type') type?: string) {
    return this.service.findAvailable(type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取车辆详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '新增车辆' })
  create(@Body() dto: CreateVehicleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新车辆信息' })
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新车辆状态' })
  updateStatus(@Param('id') id: string, @Body('status') status: VehicleStatus) {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除车辆' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
