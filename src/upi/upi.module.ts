import { Module } from '@nestjs/common';
import { UpiService } from './upi.service';
import { UpiController } from './upi.controller';

@Module({
  controllers: [UpiController],
  providers: [UpiService]
})
export class UpiModule {}
