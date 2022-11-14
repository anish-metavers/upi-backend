import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ThirdPartyService } from 'src/third-party/third-party.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, ThirdPartyService],
})
export class TransactionModule {}
