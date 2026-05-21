import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GPSTrack, GPSTrackSchema } from './tracking.schema';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GPSTrack.name, schema: GPSTrackSchema }]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService, MongooseModule],
})
export class TrackingModule {}
