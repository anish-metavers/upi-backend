import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorConfig } from 'utils/config';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split('Bearer ')[1];
    let decoded;
    if (!token) {
      throw new HttpException({ ...ErrorConfig.NO_TOKEN_FOUND }, 401);
    }
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // console.log(error);

      // if (error.name === 'TokenExpiredError')
      //   throw new HttpException('Token expired !', 401);
      throw new HttpException({ ...ErrorConfig.INVALID_TOKEN }, 401);
    }
    const { id } = decoded;
    const user = await global.DB.User.findOne({ where: { id } });

    if (!user) throw new HttpException({ ...ErrorConfig.NO_USER_FOUND }, 401);

    req['user_id'] = user.id;
    req['client_id'] = user.client_id;

    return true;
  }
}
