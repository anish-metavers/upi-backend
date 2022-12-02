import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserUpiDto } from './dto/update-user.dto';
import { AuthGuard } from 'guard/authGuard';
import { Request } from 'express';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    return await this.userService.create(req, createUserDto);
  }

  @Get()
  async findAllUser(@Req() req: Request) {
    return await this.userService.findAll(req);
  }

  @Get('upi')
  async findAllUserUpi(@Req() req: Request) {
    return await this.userService.findAllUserUpi(req);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return await this.userService.findOne(req, +id);
  }

  // @Get('roles')
  // async findOne(@Req() req: Request, @Param('id') id: string) {
  //   return await this.userService.findOne(req, +id);
  // }

  @Post('role/:user_id')
  async addRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.addRole(req, +user_id, updateUserDto);
  }

  @Delete('role/:user_id')
  removeRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.removeRole(req, +user_id, updateUserDto);
  }

  // ANISH
  @Post('upi/:user_id')
  async updateUpi(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() body: UpdateUserUpiDto,
  ) {
    return await this.userService.updateUpi(req, +user_id, body);
  }

  // ANISH
  // @Delete('upi/:user_id')
  // async removeUpi(
  //   @Req() req: Request,
  //   @Param('user_id') user_id: string,
  //   @Body() body: UpdateUserUpiDto,
  // ) {
  //   return await this.userService.removeUpi(req, +user_id, body);
  // }

  // ANISH
  @Delete('upi/:id')
  async removeUpi(@Req() req: Request, @Param('id') id: string) {
    return await this.userService.removeUpi(+id);
  }
}
