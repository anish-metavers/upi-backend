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
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { ClientApiService } from './client-api.service';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { UpdateClientApiDto } from './dto/update-client-api.dto';

@Controller('client-api')
@UseGuards(AuthGuard)
export class ClientApiController {
  constructor(private readonly clientApiService: ClientApiService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createClientApiDto: CreateClientApiDto,
  ) {
    return await this.clientApiService.create(req, createClientApiDto);
  }
  @Get(':portal_id')
  findOne(@Req() req: Request, @Param('portal_id') portal_id: string) {
    return this.clientApiService.findOne(req, +portal_id);
  }

  @Patch(':client_api_id')
  update(
    @Req() req: Request,
    @Param('client_api_id') client_api_id: string,
    @Body() updateClientApiDto: UpdateClientApiDto,
  ) {
    return this.clientApiService.update(
      req,
      +client_api_id,
      updateClientApiDto,
    );
  }
}
