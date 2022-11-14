import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //login api
  @Post('/login')
  async login(@Body() loginDto: LoginDTO) {
    const data = await this.authService.loginAPIs(loginDto);
    return data;
  }
}
