import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutingService } from './routing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRouteDto, UpdateRouteDto } from '../../dto/routing.dto';

@ApiTags('routing')
@Controller('routing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoutingController {
  constructor(private readonly service: RoutingService) {}

  @Get()
  @ApiOperation({ summary: '获取路径规划列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('dispatch/:dispatchId')
  @ApiOperation({ summary: '按调度任务查询路径规划' })
  findByDispatch(@Param('dispatchId') dispatchId: string) {
    return this.service.findByDispatch(dispatchId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取路径规划详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建路径规划（调用高德/算法）' })
  create(@Body() dto: CreateRouteDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新路径规划' })
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除路径规划' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
