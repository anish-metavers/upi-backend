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
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserListDto } from './dto/create-user.dto';
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
  async findAllUser(@Req() req: Request, @Query() query: UserListDto) {
    return await this.userService.findAll(req, query);
  }
  @UseGuards(AuthGuard)
  @Get('self')
  async findSelfUser(@Req() req: Request) {
    return await this.userService.findSelfUser(req);
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
}
