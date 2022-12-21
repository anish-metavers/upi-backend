import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientApiService } from './client-api.service';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { UpdateClientApiDto } from './dto/update-client-api.dto';

@Controller('client-api')
export class ClientApiController {
  constructor(private readonly clientApiService: ClientApiService) {}

  @Post()
  create(@Body() createClientApiDto: CreateClientApiDto) {
    return this.clientApiService.create(createClientApiDto);
  }

  @Get()
  findAll() {
    return this.clientApiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientApiService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientApiDto: UpdateClientApiDto,
  ) {
    return this.clientApiService.update(+id, updateClientApiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientApiService.remove(+id);
  }
}
