import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ColdChainService } from './cold-chain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateColdChainRecordDto, QueryColdChainRecordDto } from '../../dto/cold-chain.dto';

@ApiTags('cold-chain')
@Controller('cold-chain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ColdChainController {
  constructor(private readonly service: ColdChainService) {}

  @Get()
  @ApiOperation({ summary: '获取冷链温控记录列表' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('breaches')
  @ApiOperation({ summary: '获取超温记录（断链告警）' })
  findBreaches(@Query() query: any) {
    return this.service.findBreaches(query);
  }

  @Get('dispatch/:dispatchId')
  @ApiOperation({ summary: '按调度任务查询完整冷链记录' })
  findByDispatch(@Param('dispatchId') dispatchId: string, @Query('limit') limit?: number) {
    return this.service.findByDispatch(dispatchId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取冷链记录详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '上报温控数据（单条）' })
  create(@Body() dto: CreateColdChainRecordDto) {
    return this.service.create(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量上报温控数据' })
  batchCreate(@Body() records: any[]) {
    return this.service.batchCreate(records);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除冷链记录' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
