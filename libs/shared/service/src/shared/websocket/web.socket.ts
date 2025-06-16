// import { ChatDTO, DisputeDTO, RideDTO, UserDTO } from '@app/dto';
import { RideStatus, RideType } from '@app/enum';
import { DisputeDoc, DisputeModel, RideDoc, RideModel, UserDoc, UserModel } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import axios from 'axios';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket Gateway for ride-hailing services.
 */
@WebSocketGateway({})
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>(); // Map userId -> socketId
 
  private usersData = new Map<
    string,
    { socketId: string; lat: number; long: number; address: string; ip: string }
  >();
 

  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(DisputeModel.name) private disputeModel: Model<DisputeDoc>,
  ) {}

  /**
   * Handles new WebSocket connections.
   * @param client - Connected client socket.
   */
  async handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    const riderId = client.handshake.query.riderId;

    const userData = {
      socketId: client.id,
      lat: client.handshake.query.lat || 0,
      long: client.handshake.query.long || 0,
      address: client.handshake.query.address || '',
      ip: client.handshake.query.ip,
    };

    let ip =
      client.handshake.headers['x-forwarded-for'] || client.handshake.address;
    let ip2 = userData.ip ? userData.ip : Array.isArray(ip) ? ip[0] : ip;

    //  console.log(ip2,userData)
    const location = await this.getLocationFromIP(ip2 as string);
    // console.log('User connected:', { userId, location });


    if (userId) {
      this.usersData.set(userId, userData);
    }
    this.server.to(client.id).emit('my-data', { userData, location });
  }

  /**
   * Handles WebSocket disconnections.
   * @param client - Disconnected client socket.
   */
  handleDisconnect(client: any) {
    this.removeClient(client.id, this.users, this.usersData);
   
  }

  private removeClient(
    socketId: string,
    userMap: Map<string, string>,
    dataMap: Map<string, any>,
  ) {
    const userId = [...userMap.entries()].find(
      ([_, id]) => id === socketId,
    )?.[0];
    if (userId) {
      userMap.delete(userId);
      dataMap.delete(userId);
    }
  }



  // /**
  //  * Handles ride acceptance.
  //  * @param userId - ID of the accepting user.
  //  * @param data - Ride details.
  //  */
  @SubscribeMessage('notification')
  async walletNotification(
    @MessageBody() payload: { data: any;  userID: string },
  ) {
    const { data, userID } = payload;
    const userSocketId = this.usersData.get(userID);
    console.log(userSocketId);
    if (userSocketId)
      this.server.to(userSocketId.socketId).emit('flutter-wallet', data);
  }



  // /**
  //  * Fetches approximate location based on IP address.
  //  * @param ip - User's IP address.
  //  * @returns - Location object with latitude, longitude, and address.
  //  */
  async getLocationFromIP(ip: string) {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      if (response.data.status === 'fail') return null;
      return {
        lat: response.data.lat,
        long: response.data.lon,
        address: `${response.data.city}, ${response.data.regionName}, ${response.data.country}`,
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  // /**
  //  * Calculates the distance (in km) between two coordinates.
  //  * @param lat1 - Latitude of first point.
  //  * @param lon1 - Longitude of first point.
  //  * @param lat2 - Latitude of second point.
  //  * @param lon2 - Longitude of second point.
  //  * @returns - Distance in kilometers.
  //  */
  getDistance(
    lat1: number = 0,
    lon1: number = 0,
    lat2: number = 0,
    lon2: number = 0,
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }


}
