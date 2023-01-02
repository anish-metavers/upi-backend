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
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';
import { AssignUpiService } from './assign-upi.service';
import { Request } from 'express';
import { AssignUpiDto, AssignUpiListDto } from './dto/assignUpi.dto';

@Controller('assign-upi')
@UseGuards(AuthGuard)
export class AssignUpiController {
  constructor(private readonly assignUpiService: AssignUpiService) {}

  @Post(':user_id')
  async assignUpi(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() body: AssignUpiDto,
  ) {
    return await this.assignUpiService.assignUpi(req, +user_id, body);
  }

  @Delete(':user_upi_id')
  async removeUpi(
    @Req() req: Request,
    @Param('user_upi_id') user_upi_id: string,
  ) {
    return await this.assignUpiService.removeUpi(+user_upi_id);
  }

  @Get()
  async findAllUserUpi(@Req() req: Request, @Query() query: AssignUpiListDto) {
    return await this.assignUpiService.findAllUserUpi(req, query);
  }
}
