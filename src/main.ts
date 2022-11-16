import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import DATABASE from 'model';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  await DATABASE();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({}));
  await app.listen(3500);
}
bootstrap();
