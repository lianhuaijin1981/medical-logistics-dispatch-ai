import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGPSTrackDto, QueryGPSTrackDto } from '../../dto/tracking.dto';

@ApiTags('tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly service: TrackingService) {}

  @Get()
  @ApiOperation({ summary: '获取 GPS 轨迹列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('latest/:vehicleId')
  @ApiOperation({ summary: '获取车辆最新位置' })
  findLatest(@Param('vehicleId') vehicleId: string) {
    return this.service.findLatest(vehicleId);
  }

  @Get('dispatch/:dispatchId')
  @ApiOperation({ summary: '按调度任务查询完整轨迹' })
  findTrackByDispatch(@Param('dispatchId') dispatchId: string, @Query('limit') limit?: number) {
    return this.service.findTrackByDispatch(dispatchId, limit);
  }

  @Get('timerange/:vehicleId')
  @ApiOperation({ summary: '按时间段查询车辆轨迹' })
  findTrackByTimeRange(
    @Param('vehicleId') vehicleId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.service.findTrackByTimeRange(vehicleId, startTime, endTime);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条轨迹详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '上报 GPS 位置（单条）' })
  create(@Body() dto: CreateGPSTrackDto) {
    return this.service.create(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量上报 GPS 位置' })
  batchCreate(@Body() tracks: any[]) {
    return this.service.batchCreate(tracks);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除轨迹记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
