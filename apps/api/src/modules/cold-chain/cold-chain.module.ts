import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColdChainRecord, ColdChainRecordSchema } from './cold-chain.schema';
import { ColdChainController } from './cold-chain.controller';
import { ColdChainService } from './cold-chain.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ColdChainRecord.name, schema: ColdChainRecordSchema }]),
  ],
  controllers: [ColdChainController],
  providers: [ColdChainService],
  exports: [ColdChainService, MongooseModule],
})
export class ColdChainModule {}
