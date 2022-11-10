import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, SignupDTO } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Signup api
  // @Post('/signup')
  // async create(@Body() signupDto: SignupDTO) {
  //   const data = await this.authService.signupAPIs(signupDto);
  //   const token = this.authService.createJWT(data,data);
  //   return { data, token };
  // }

  //login api
  @Post('/login')
  async login(@Body() loginDto: LoginDTO) {
    const data = await this.authService.loginAPIs(loginDto);
    return data;
  }
}
