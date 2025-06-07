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
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, string>(); // Map userId -> socketId
  private pendingNotifications = new Map<string, any[]>(); // Store notifications for offline users

  handleConnection(client: any) {
    const userId = client.handshake.query.userId; // Pass userId during connection
    console.log('userId', userId);
    if (userId) {
      this.clients.set(userId, client.id);

       // Check if there are pending notifications
       if (this.pendingNotifications.has(userId)) {
        const notifications = this.pendingNotifications.get(userId) || [];

        // Send all stored notifications
        notifications.forEach((notification) => {
          this.server.to(client.id).emit('notification', notification);
        });

        // Clear notifications after sending
        this.pendingNotifications.delete(userId);
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

  sendNotification(userId: string, data: any) {
    const socketId = this.clients.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
    }else {
      // User is offline, store notification
      if (!this.pendingNotifications.has(userId)) {
        this.pendingNotifications.set(userId, []);
      }
      this.pendingNotifications.get(userId)?.push(data);
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
