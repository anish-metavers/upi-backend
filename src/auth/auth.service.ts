import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/create-auth.dto';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  createJWT(id: number, email: string): string {
    return jwt.sign({ id, email }, 'secret', { expiresIn: '1h' });
  }

  async loginAPIs(loginDto: LoginDTO) {
    const { email, password } = loginDto;
    const check = await global.DB.Client.findOne({
      where: { email },
    });
    if (password !== check?.password)
      throw new HttpException('Invalid  password', 401);
    const token = this.createJWT(check.id, check.email);

    return {
      message: 'Login successfully',
      status: true,
      response: {
        client_id: check.id,
        email: check.email,
        token,
      },
    };
  }
}
