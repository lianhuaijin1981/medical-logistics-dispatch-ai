import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutePlan, RoutePlanSchema } from './routing.schema';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoutePlan.name, schema: RoutePlanSchema }]),
  ],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService, MongooseModule],
})
export class RoutingModule {}
