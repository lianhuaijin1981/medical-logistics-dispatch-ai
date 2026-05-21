import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PickingService } from './picking.service';

@ApiTags('picking')
@Controller('picking')
export class PickingController {
  constructor(private readonly service: PickingService) {}

  @Get()
  @ApiOperation({ summary: '获取列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
