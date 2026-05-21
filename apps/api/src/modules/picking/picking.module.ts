import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PickingTask, PickingTaskSchema } from './picking.schema';
import { PickingController } from './picking.controller';
import { PickingService } from './picking.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PickingTask.name, schema: PickingTaskSchema }]),
  ],
  controllers: [PickingController],
  providers: [PickingService],
  exports: [PickingService, MongooseModule],
})
export class PickingModule {}
