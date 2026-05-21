import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DispatchTask, DispatchTaskSchema } from './dispatch.schema';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DispatchTask.name, schema: DispatchTaskSchema }]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService, MongooseModule],
})
export class DispatchModule {}
