import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split('Bearer ')[1];
    let decoded;
    if (!token) {
      throw new HttpException('No authorization headers token found', 401);
    }
    try {
      decoded = jwt.verify(token, 'secret');
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        throw new HttpException('Token expired !', 401);
      throw new HttpException('Invalid authorization headers token!', 401);
    }
    const { id } = decoded;
    if (!id) throw new HttpException('No user found with this user', 401);
    req['client_id'] = id;
    const userRoles = await global.DB.Client.findAll({
      where: { id },
    });

    return true;
  }
}
