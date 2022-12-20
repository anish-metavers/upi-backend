import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { ClientModule } from './client/client.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PortalModule } from './portal/portal.module';
import { AssignRoleModule } from './assign-role/assign-role.module';
import { AssignUpiModule } from './assign-upi/assign-upi.module';
import { AssignPortalModule } from './assign-portal/assign-portal.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    TransactionModule,
    ClientModule,
    UserModule,
    RoleModule,
    PortalModule,
    AssignRoleModule,
    AssignUpiModule,
    AssignPortalModule,
  ],
})
export class AppModule {}
