import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(3002, {})
export class RideGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, string>(); // Map userId -> socketId
  private pendingRides = new Map<string, any[]>(); // Store rides for offline users

  handleConnection(client: any) {
    const userId = client.handshake.query.userId; // Pass userId during connection
    console.log('userId', userId);
    if (userId) {
      this.clients.set(userId, client.id);

       // Check if there are pending rides
       if (this.pendingRides.has(userId)) {
        const rides = this.pendingRides.get(userId) || [];

        // Send all stored rides
        rides.forEach((ride) => {
          this.server.to(client.id).emit('ride', ride);
        });

        // Clear rides after sending
        this.pendingRides.delete(userId);
      }
    }
  }

  handleDisconnect(client: any) {
    const userId = [...this.clients.entries()].find(
      ([_, id]) => id === client.id,
    )?.[0];
    if (userId) {
      this.clients.delete(userId);
    }
  }

  sendRide(userId: string, data: any) {
    const socketId = this.clients.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('ride', data);
    }else {
      // User is offline, store ride
      if (!this.pendingRides.has(userId)) {
        this.pendingRides.set(userId, []);
      }
      this.pendingRides.get(userId)?.push(data);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: any, room: string) {
    client.join(room);
  }
  @SubscribeMessage('joinRoom')
  handleNewMessage(@MessageBody() message) {
    console.log('message12', message);
  }
}
