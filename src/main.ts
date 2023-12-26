import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); 
  const app = await NestFactory.create(AppModule);

  app.enableCors();
app.useWebSocketAdapter(new IoAdapter(app));
app.getHttpAdapter();
  await app.listen(3003);
}
bootstrap();
