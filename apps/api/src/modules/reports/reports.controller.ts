import { Controller, Get, Post, Body, Param, Query, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto, UpdateReportDto } from '../../dto/report.dto';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @ApiOperation({ summary: '获取报表列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报表详情（含数据）' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建报表（草稿/调度任务）' })
  create(@Body() dto: CreateReportDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新报表配置' })
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/generate')
  @ApiOperation({ summary: '完成报表生成（写入结果）' })
  generate(
    @Param('id') id: string,
    @Body() body: { summary?: any; data?: any; file?: any },
  ) {
    return this.service.generate(id, body.summary, body.data, body.file);
  }

  @Patch(':id/fail')
  @ApiOperation({ summary: '标记报表生成失败' })
  failGenerate(@Param('id') id: string, @Body('errorMessage') errorMessage: string) {
    return this.service.failGenerate(id, errorMessage);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除报表' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
