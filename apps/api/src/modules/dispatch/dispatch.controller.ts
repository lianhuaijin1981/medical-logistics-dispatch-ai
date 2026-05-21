import { Controller, Get, Post, Body, Param, Query, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDispatchDto, UpdateDispatchDto, UpdateDispatchStatusDto } from '../../dto/dispatch.dto';

@ApiTags('dispatch')
@Controller('dispatch')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DispatchController {
  constructor(private readonly service: DispatchService) {}

  @Get()
  @ApiOperation({ summary: '获取调度任务列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: '按车辆查询调度记录' })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.service.findByVehicle(vehicleId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: '按司机查询调度记录' })
  findByDriver(@Param('driverId') driverId: string) {
    return this.service.findByDriver(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取调度任务详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建调度任务' })
  create(@Body() dto: CreateDispatchDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新调度任务' })
  update(@Param('id') id: string, @Body() dto: UpdateDispatchDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新调度状态（发车/到达/完成）' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status, dto.operator, dto.remark);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除调度任务' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
