import { WebSocketGateway, SubscribeMessage, MessageBody ,WebSocketServer, ConnectedSocket} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { OnGatewayConnection } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import * as fs from 'fs';



@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection{
  @WebSocketServer() server: Server;
  private connectedClients: Set<String>;
  private storagePath = 'connectedClients.json';
  constructor(private readonly socketService: SocketService) {
    this.connectedClients = new Set(this.loadConnectedClients());
  }

  async handleConnection(client: any, ...args: any[]) {
    const queryParams = client.handshake.query;
    console.log('Connected with query parameters:', queryParams);
    const result = await this.socketService.authenticate({email:"mitul@gmail.com",password:"mitul@123"});
    console.log(result);
    
    if(result.success) {
      this.socketService.addevent({event:"connection established",taskid:""});
    this.connectedClients.add(client.id);
    this.emitConnectedClientsToClient(client);
    this.saveConnectedClients();
    }else{
      client.disconnect();
      console.log("not authorised");
      
    }
  }

  handleDisconnect(client: any, ...args: any[]) {
    this.connectedClients.delete(client.id);
    this.saveConnectedClients();
  }

  private emitConnectedClientsToClient(client: Socket) {
    const clientsArray = Array.from(this.connectedClients);
    client.emit('connectedClients', clientsArray);
  }

  private loadConnectedClients(): string[] {
    try {
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      return JSON.parse(data) || [];
    } catch (error) {
      return [];
    }
  }
  private saveConnectedClients() {
    fs.writeFileSync(this.storagePath, JSON.stringify(Array.from(this.connectedClients)));
  }



  @SubscribeMessage('NEW_JOB')
  emitcommand(@MessageBody() data:{command: string,client: string, taskid:string}, @ConnectedSocket() sender:Socket) {
    const { command, client: targetClientId ,taskid} = data;

    this.socketService.insertData({command:command,Task_id:taskid,sender:sender.id,receiver:targetClientId});
    const targetClientSocket = Array.from(this.server.sockets.sockets.values()).find(
      (socket: Socket) => socket.id === targetClientId,
    );
    if (targetClientSocket) {
      targetClientSocket.emit('NEW_JOB', { command: "ls", taskid: taskid});
      return { success: true };
    } else {
      return { success: false, error: 'Target client not found' };
    }
  }

  @SubscribeMessage('JOB_DONE')
  async result(@MessageBody() data:{result: string,taskid: string}) {
    const { result, taskid} = data;


    const updatedData = await this.socketService.updateData({Task_id:taskid,response:result,Task_done_timestamp: new Date().toString()});
    console.log(updatedData,"updated Data",updatedData.data.sender);
    
    const targetClientSocket = Array.from(this.server.sockets.sockets.values()).find(
      (socket: Socket) => socket.id === updatedData.data.sender,
    );
    if (targetClientSocket) {
      targetClientSocket.emit('JOB_DONE', { result });
      return { success: true };
    } else {
      console.log("in else");
      
      return { success: false, error: 'Target client not found' };
    }
  }


}
