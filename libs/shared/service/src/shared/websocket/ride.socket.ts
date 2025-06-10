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
export class RideSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>(); // Map userId -> socketId
  private riders = new Map<string, string>(); // Map riderId -> socketId
  private drivers = new Map<string, string>(); // Map driverId -> socketId

  private usersData = new Map<
    string,
    { socketId: string; lat: number; long: number; address: string; ip: string }
  >();
  private ridersData = new Map<
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

    if (riderId) {
      this.ridersData.set(riderId, userData);
    }
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
    this.removeClient(client.id, this.riders, this.ridersData);
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

  /**
   * Sends a notification to a user via WebSocket.
   * @param userId - ID of the user.
   * @param data - Notification data.
   */
  sendRideSocket(userId: string, data: any) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', data);
    }
  }

  /**
   * Finds a ride and notifies nearby drivers or riders.
   * @param userId - User requesting the ride.
   * @param data - Ride request data.
   * @param rideType - Type of ride (RIDE, PICKUP, DISPATCH).
   */
  // @SubscribeMessage('find-rider')
  // checkForRide(
  //   @MessageBody()
  //   payload: {
  //     recommendedPrice: string;
  //     userId: string;
  //     data: { ride: RideDTO; user: any };
  //   },
  // ) {
  //   const { userId, data, recommendedPrice } = payload;
  //   // console.log("payload",payload)

  //   const userLocation = this.usersData.get(userId);
  //   console.log('userLocation', userLocation);
  //   const event = 'rider-found';
  //   this.ridersData.forEach((targetData, targetId) => {
  //     const distance = this.getDistance(
  //       userLocation?.lat,
  //       userLocation?.long,
  //       targetData.lat,
  //       targetData.long,
  //     );
  //     this.server.to(targetData.socketId).emit(event, {
  //       message: `${RideType.DISPATCH} found`,
  //       status: true,
  //       data: { data, distance, recommendedPrice },
  //     });
  //   });
  // }

  // //bid price for a ride
  // @SubscribeMessage('bid-ride')
  // async bidRide(
  //   @MessageBody()
  //   payload: {
  //     price: number;
  //     reason: string;
  //     rideID: string;
  //     riderID: string;
  //   },
  // ) {
  //   const { price, reason, rideID, riderID } = payload;

  //   const rider = await this.userModel.findById(riderID);
  //   // await this.rideModel.findById(rideID);

  //   const ride = await this.rideModel.findByIdAndUpdate(
  //     rideID,
  //     { $push: { bids: { price, reason, riderID } } },
  //     { new: true },
  //   );

  //   const userSocketId = this.usersData.get(ride.userID);
  //   console.log('userSocketId', userSocketId);

  //   if (userSocketId) {
  //     this.server.to(userSocketId.socketId).emit('ride-bidded', {
  //       message: 'Ride Bidded',
  //       status: true,
  //       data: {
  //         price,
  //         reason,
  //         rideID,
  //         ride,
  //         rider,
  //       },
  //     });
  //   }
  // }

  // /**
  //  * Handles ride acceptance.
  //  * @param userId - ID of the accepting user.
  //  * @param data - Ride details.
  //  */
  // @SubscribeMessage('accept-ride')
  // async acceptRide(
  //   @MessageBody() payload: { price: number; rideID: RideDTO; riderID: string },
  // ) {
  //   const { price, rideID, riderID } = payload;

  //   const ride = await this.rideModel
  //     .findByIdAndUpdate(
  //       rideID,
  //       {
  //         bidPrice: price,
  //         status: { status: RideStatus.ACCEPTED, date: new Date() },
  //         "statusDate.accepted": new Date(),         
  //         riderID,
  //       },
  //       { new: true },
  //     )
  //     .populate('userID', 'fullname email phone profileImage username');

  //   const userSocketId = this.ridersData.get(riderID);
  //   console.log(userSocketId);
  //   if (userSocketId)
  //     this.server.to(userSocketId.socketId).emit('ride-accepted', {
  //       message: 'Ride Accepted',
  //       status: true,
  //       data: ride,
  //     });
  // }

  // //ride status update
  // @SubscribeMessage('update-ride-status')
  // async updateRideStatus(
  //   @MessageBody()
  //   payload: {
  //     ride: RideDTO;

  //     isRider: boolean;
  //   },
  // ) {
  //   const { ride, isRider } = payload;

  //   const userSocketId = !isRider
  //     ? this.ridersData.get(ride.riderID)
  //     : this.usersData.get(ride.userID);

  //   if (userSocketId) {
  //     this.server.to(userSocketId.socketId).emit('ride-status', {
  //       message: 'Ride Status',
  //       status: true,
  //       data: ride,
  //     });
  //   }
  // }

  // /**
  //  * Allows a user to join a chat room.
  //  * @param client - WebSocket client.
  //  * @param room - Room name.
  //  */
  // @SubscribeMessage('joinRoom')
  // handleJoinRoom(client: any, room: string) {
  //   client.join(room);
  // }

  // /**
  //  * Handles incoming messages.
  //  * @param message - Message data.
  //  */
  // @SubscribeMessage('sendMessage')
  // handleNewMessage(
  //   @MessageBody()
  //   payload: {
  //     isRider: boolean;
  //     data: ChatDTO;
  //   },
  // ) {
  //   const { isRider, data } = payload;

  //   const userSocketId = !isRider
  //     ? this.ridersData.get(data?.receiverID)
  //     : this.usersData.get(data?.receiverID);

  //   console.log(userSocketId, data?.receiverID, isRider);
  //   if (userSocketId)
  //     this.server.to(userSocketId.socketId).emit('newMessage', data);
  // }

  // //Handles incoming dispute 
  // @SubscribeMessage('dispute')
  // async handleDispute(
  //   @MessageBody()
  //   payload: {
  //     data: DisputeDTO;
  //   },
  // ) {
  //   const {  data } = payload;

  //   const ride= await this.disputeModel.findById(data?.disputeID|| data?._id).populate({
  //     path: 'rideID',
  //     select: '-bids',

  //     populate: [
  //       {
  //         path: 'userID',
  //         select: 'fullname username email phone profileImage userType',
  //       },
  //       {
  //         path: 'riderID',
  //         select: 'fullname username email phone profileImage userType',
  //       },
  //     ],
  //   }) as any

  //   const newData = await this.disputeModel
  //   .findById(data?._id)
  //   .populate(
  //     'userID',
  //     'fullname username email phone profileImage userType isAdmin isSuperAdmin',
  //   )
  //   .populate({
  //     path: 'rideID',
  //     select: '-bids',

  //     populate: [
  //       {
  //         path: 'userID',
  //         select: 'fullname username email phone profileImage userType',
  //       },
  //       {
  //         path: 'riderID',
  //         select: 'fullname username email phone profileImage userType',
  //       },
  //     ],
  //   }).populate('lastMessageBy', 'fullname username email phone profileImage userType')
  //   .populate('adminID', 'fullname username email phone profileImage userType');
  //   const admin= this.usersData.get(ride?.adminID)
  //   const rider = this.ridersData.get(ride?.rideID?.riderID)
  //   const user= this.usersData.get(ride?.rideID?.userID);
  //   // this.server.emit('dispute1', {data,ride});
  //   if (user)
  //     this.server.to(user.socketId).emit('dispute', newData);

      
  //   if (rider)
  //     this.server.to(rider.socketId).emit('dispute', newData);
  //   if(admin)
  //     this.server.to(admin.socketId).emit('dispute', newData);
  // }
   

  //   //Handles incoming dispute 
  // @SubscribeMessage('track-location')
  // async handleTrackLocation(
  //   @MessageBody()
  //   payload: any,
  // ) {
   
  //  const user= this.usersData.get(payload?.userID);
  //  console.log("track-location : ", payload )
      
  //   // this.server.emit('dispute1', {data,ride});
  //   if (user)
  //     this.server.to(user.socketId).emit('track-location', payload);
  // }

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
  // getDistance(
  //   lat1: number = 0,
  //   lon1: number = 0,
  //   lat2: number = 0,
  //   lon2: number = 0,
  // ): number {
  //   const R = 6371;
  //   const dLat = (lat2 - lat1) * (Math.PI / 180);
  //   const dLon = (lon2 - lon1) * (Math.PI / 180);
  //   const a =
  //     Math.sin(dLat / 2) ** 2 +
  //     Math.cos(lat1 * (Math.PI / 180)) *
  //       Math.cos(lat2 * (Math.PI / 180)) *
  //       Math.sin(dLon / 2) ** 2;
  //   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // }


}
