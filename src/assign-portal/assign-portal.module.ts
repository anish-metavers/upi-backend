import { Module } from '@nestjs/common';
import { AssignPortalService } from './assign-portal.service';
import { AssignPortalController } from './assign-portal.controller';

@Module({
  controllers: [AssignPortalController],
  providers: [AssignPortalService]
})
export class AssignPortalModule {}
