import { Module } from '@nestjs/common';
import { ClientApiService } from './client-api.service';
import { ClientApiController } from './client-api.controller';

@Module({
  controllers: [ClientApiController],
  providers: [ClientApiService]
})
export class ClientApiModule {}
