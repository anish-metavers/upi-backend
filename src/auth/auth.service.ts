import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/create-auth.dto';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  createJWT(id: number, email: string): string {
    return jwt.sign({ id, email }, 'secret', { expiresIn: '24h' });
  }

  async loginAPIs(loginDto: LoginDTO) {
    const { email, password } = loginDto;
    const checkClient = await global.DB.Client.findOne({
      where: { email },
    });

    if (!checkClient || password !== checkClient.password)
      throw new HttpException('User Not Exist or Invalid Password', 401);

    const token = this.createJWT(checkClient.id, checkClient.email);

    return {
      message: 'Login successfully',
      success: true,
      response: {
        client_id: checkClient.id,
        email: checkClient.email,
        token,
      },
    };
  }
}
