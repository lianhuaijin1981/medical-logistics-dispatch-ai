import { Controller, Get, Post, Body, Param, Query, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../../dto/warehouse.dto';

@ApiTags('warehouses')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: '获取仓库列表' })
  findAll(@Query() query: any) {
    return this.warehousesService.findAll(query);
  }

  @Get('type/:type')
  @ApiOperation({ summary: '按类型获取仓�?' })
  findByType(@Param('type') type: string) {
    return this.warehousesService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
