import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: '获取告警列表' })
  findAll(@Query() query: any) {
    return this.alertsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取告警详情' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: '处理告警' })
  resolve(@Param('id') id: string, @Body() body: { note?: string; resolvedBy?: string }) {
    return this.alertsService.resolve(id, body.note, body.resolvedBy);
  }
}
