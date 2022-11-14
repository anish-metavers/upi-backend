import { Module } from '@nestjs/common';
import { UpiModule } from './upi/upi.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [UpiModule, ConfigModule.forRoot(), AuthModule, TransactionModule],
})
export class AppModule {}
