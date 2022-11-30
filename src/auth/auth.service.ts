import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/create-auth.dto';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  createJWT(id: number, email: string): string {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async loginAPIs(loginDto: LoginDTO) {
    const { email, password } = loginDto;
    const checkUser = await global.DB.User.findOne({
      where: { email },
    });

    if (!checkUser || password !== checkUser.password)
      throw new HttpException('User Not Exist or Invalid Password', 401);

    const token = this.createJWT(checkUser.id, checkUser.email);

    return {
      message: 'Login successfully',
      success: true,
      response: {
        user_id: checkUser.id,
        email: checkUser.email,
        token,
      },
    };
  }
}
