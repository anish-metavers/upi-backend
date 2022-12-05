import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
// import { ErrorConfig } from 'utils/config';

@Injectable()
export class PermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    console.log('Path:', req.route.path);
    console.log('Method:', Object.keys(req.route.methods)[0]);

    const user_id = req['user_id'];
    if (!user_id) {
      console.log(
        'Did you forget to use the auth guard before the permissions check ?',
      );
      throw new HttpException(
        {
          message: 'No User Found',
          statusCode: 401,
        },
        401,
      );
    }

    const [userRoles, permission] = await Promise.all([
      global.DB.UserRole.findAll({
        where: { user_id },
      }),
      global.DB.Permission.findOne({
        where: {
          path: req.route.path,
          method: Object.keys(req.route.methods)[0],
        },
      }),
    ]);
    // console.log('Permission: ' + permission);

    if (!permission)
      throw new HttpException('No permission found with this route', 404);

    const roleIdsArr = userRoles.map((role) => role.role_id);

    const rolePermission = await global.DB.RolePermission.findOne({
      where: {
        permission_id: permission.id,
        role_id: {
          [Op.in]: roleIdsArr,
        },
      },
    });

    if (!rolePermission)
      throw new HttpException('Invalid permissions found', 401);

    return true;
  }
}
