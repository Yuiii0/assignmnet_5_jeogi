import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  //Express로 정의
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(5050);
}
bootstrap();
