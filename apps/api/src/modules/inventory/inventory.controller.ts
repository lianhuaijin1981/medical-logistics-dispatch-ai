import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInventoryDto, UpdateInventoryDto } from '../../dto/inventory.dto';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: '获取库存列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: '获取低库存预警列表' })
  findLowStock(@Query() query: any) {
    return this.service.findLowStock(query);
  }

  @Get('expiring')
  @ApiOperation({ summary: '获取临期库存列表' })
  findExpiring(@Query('days') days?: string, @Query() query?: any) {
    return this.service.findExpiring(days ? Number(days) : 30, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取库存详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建库存记录' })
  create(@Body() dto: CreateInventoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存记录' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
