import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, TransactionModule, ClientModule],
})
export class AppModule {}
