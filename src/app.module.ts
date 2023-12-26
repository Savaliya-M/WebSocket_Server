import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket/socket.module';
import { SocketGateway } from './socket/socket.gateway';

@Module({
  imports: [SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
