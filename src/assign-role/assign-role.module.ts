import { Module } from '@nestjs/common';
import { AssignRoleService } from './assign-role.service';
import { AssignRoleController } from './assign-role.controller';

@Module({
  controllers: [AssignRoleController],
  providers: [AssignRoleService]
})
export class AssignRoleModule {}
