import { Module } from '@nestjs/common';
import { AssignUpiService } from './assign-upi.service';
import { AssignUpiController } from './assign-upi.controller';

@Module({
  controllers: [AssignUpiController],
  providers: [AssignUpiService]
})
export class AssignUpiModule {}
