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
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard, PermissionGuard)
  @Post()
  async createUser(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    return await this.userService.create(req, createUserDto);
  }
  @UseGuards(AuthGuard, PermissionGuard)
  @Get()
  async findAllUser(@Req() req: Request) {
    return await this.userService.findAll(req);
  }
  @UseGuards(AuthGuard, PermissionGuard)
  @Get('upi')
  async findAllUserUpi(@Req() req: Request) {
    return await this.userService.findAllUserUpi(req);
  }
  @UseGuards(AuthGuard)
  @Get('/role-permission/')
  async findUserRolePermissions(@Req() req: Request) {
    return await this.userService.findUserRolePermissions(req);
  }
  @UseGuards(AuthGuard, PermissionGuard)
  @Get(':user_id')
  async findOne(@Req() req: Request, @Param('user_id') user_id: string) {
    return await this.userService.findOne(req, +user_id);
  }
  @UseGuards(AuthGuard, PermissionGuard)
  @Post('role/:user_id')
  async addRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.addRole(req, +user_id, updateUserDto);
  }
  @UseGuards(AuthGuard, PermissionGuard)
  @Delete('role/:user_id')
  removeRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.removeRole(req, +user_id, updateUserDto);
  }

  // ANISH
  @UseGuards(AuthGuard, PermissionGuard)
  @Post('upi/:user_id')
  async updateUpi(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() body: UpdateUserUpiDto,
  ) {
    return await this.userService.updateUpi(req, +user_id, body);
  }

  // ANISH
  @UseGuards(AuthGuard, PermissionGuard)
  @Delete('upi/:id')
  async removeUpi(@Req() req: Request, @Param('id') id: string) {
    return await this.userService.removeUpi(+id);
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
}
