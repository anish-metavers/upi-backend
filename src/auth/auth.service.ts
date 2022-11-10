import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO, SignupDTO } from './dto/create-auth.dto';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  createJWT(id: number, email: string): string {
    return jwt.sign({ id, email }, 'secret', { expiresIn: '1h' });
  }

  // async signupAPIs(signupDto: SignupDTO) {
  //   const email = signupDto.email;
  //   const auth = await global.DB.Client.findOne({
  //     where: { email },
  //   });
  //   if (auth) {
  //     throw new HttpException('Client already exist', 401);
  //   }
  //   const user = await global.DB.Client.create({
  //     ...signupDto,
  //   });
  //   return {
  //     message: 'Signup successfully',
  //     status: true,
  //     data: {
  //       id: user.id,
  //       name: user.name,
  //       email: user.email,
  //     },
  //   };
  // }

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
