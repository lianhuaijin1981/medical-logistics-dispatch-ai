import { Controller, Get, Post, Body, Param, Query, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PickingService } from './picking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePickingDto, UpdatePickingDto } from '../../dto/picking.dto';

@ApiTags('picking')
@Controller('picking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PickingController {
  constructor(private readonly service: PickingService) {}

  @Get()
  @ApiOperation({ summary: '获取拣货任务列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('wave/:waveNo')
  @ApiOperation({ summary: '按波次号查询拣货任务' })
  findByWave(@Param('waveNo') waveNo: string) {
    return this.service.findByWave(waveNo);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取拣货任务详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建拣货任务' })
  create(@Body() dto: CreatePickingDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新拣货任务' })
  update(@Param('id') id: string, @Body() dto: UpdatePickingDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: '开始拣货' })
  startPicking(@Param('id') id: string, @Body('operator') operator: string) {
    return this.service.startPicking(id, operator);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: '完成拣货' })
  completePicking(
    @Param('id') id: string,
    @Body('operator') operator: string,
    @Body('items') items?: any[],
  ) {
    return this.service.completePicking(id, operator, items);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除拣货任务' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
