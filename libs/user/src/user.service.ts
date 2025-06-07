import {
  UserModel,
  ActivityLogDoc,
  ActivityLogModel,
  UserDoc,
  RideModel,
  RideDoc,
} from '@app/schema';
import {
  NotificationService,
  ObjectReturnType,
  serviceResponse,
} from '@app/service';
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Action, UserType } from '@app/enum';

import { UpdateVerificationStatusDTO, UserDTO } from '@app/dto';
// import { OrganizationAbilityFactory } from './organization-ability.factory';
import * as moment from 'moment';
import { stat } from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService,
  ) {}

  async upset(user: UserDTO, userData: UserDTO): Promise<ObjectReturnType> {
    try {
      const created = await this.userModel.create(user);

      this.notificationActivity.notificationActivity({
        action: 'create',
        entityType: 'User',
        entityID: created._id.toString(),
        userID: userData?._id,
        details: `${userData?.fullname} created an user`,
        playerIds:[ userData?.playerId ??""],
      });
      return serviceResponse({
        message: 'created successfully',
        data: created,
      });
    } catch (error) {
      throw new NotAcceptableException(error.message);
    }
  }

  async update(user: UserDTO, userData: UserDTO): Promise<ObjectReturnType> {
    const updatedRole = await this.userModel.findByIdAndUpdate(user._id, user, {
      new: true,
    });

    this.notificationActivity.notificationActivity({
      action: 'updated',
      entityType: 'User',
      entityID: updatedRole._id.toString(),
      userID: userData?._id,

      playerIds:[ userData?.playerId ??""],
      details: `${userData?.fullname} updated an user`,
    });
    return serviceResponse({
      message: 'updated successfully',
      data: updatedRole,
    });
  }

  async savePlayerId( body: { playerId: string, userID: string }) {
    const user = await this.userModel.findByIdAndUpdate(body.userID,{playerId:body.playerId},{new:true});
    if (!user) {
      throw new NotFoundException('User not found');
    }
  return serviceResponse({
      message: 'Player ID saved successfully',
      data: user,
    });
  }

  async findbyId(id: any): Promise<ObjectReturnType> {
    try {
      const data = await this.userModel.findById(id);
      if (!data) {
        throw new NotFoundException();
      }
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findbyAny(
    params: { key: string; value: string },
    query: any,
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { skip = 0, limit = 0 } = query;

    const result = await this.userModel
      .find({ [key]: value })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!result.length) {
      throw new NotFoundException(value + ' not found in field ' + key);
    }
    return serviceResponse({
      message: 'Success',
      data: result,
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { skip = 0, limit = 0 } = query;
    try {
      const data = await this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async delete(_id: string[], userData: UserDTO): Promise<ObjectReturnType> {
    const user = await this.userModel.find({ _id });
    for (let i = 0; i < user.length; i++) {
      //   await this.organizationAbilityFactory.checkAbility(
      //     userData.organizationID,
      //     userData?._id.toString(),
      //     Action.Delete,
      //     UserModel,
      //   );

      // this.notificationActivity.notificationActivity({
      //   action: 'delete',
      //   entityType: 'User',
      //   playerIds:[ userData?.playerId ??""],
      //   entityID: user[i]._id.toString(),
      //   userID: userData?._id,
      //   details: `${userData?.fullname} delete an user`,
      // });
    }
    const data = await this.userModel.deleteMany({ _id });

    try {
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteByEmails(_id: string[]): Promise<ObjectReturnType> {
    const data = await this.userModel.deleteMany({ email: _id });

    try {
      return serviceResponse({
        message: 'Success',
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findRecentUsers(
    period: 'day' | 'week' | 'month',
    query: any,
  ): Promise<ObjectReturnType> {
    const { skip = 0, limit = 0 } = query;

    let startDate = moment().startOf('day'); // Start from today at 00:00
    let endDate = moment().endOf('day'); // End today at 23:59

    switch (period) {
      case 'day':
        startDate = moment().subtract(1, 'day').startOf('day'); // Yesterday 00:00
        endDate = moment().endOf('day'); // Today 23:59
        break;
      case 'week':
        startDate = moment().subtract(7, 'days').startOf('day'); // 7 days ago 00:00
        break;
      case 'month':
        startDate = moment().subtract(1, 'month').startOf('day'); // 1 month ago 00:00
        break;
    }

    const result = await this.userModel
      .find({ createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return serviceResponse({
      message: `Users registered in the last ${period}`,
      data: result,
    });
  }

  async countRecentUsers(): Promise<ObjectReturnType> {
    const today = moment().endOf('day');
    const lastDayStart = moment().subtract(1, 'day').startOf('day');
    const lastWeekStart = moment().subtract(7, 'days').startOf('day');
    const lastMonthStart = moment().subtract(1, 'month').startOf('day');

    const userTypes = Object.values(UserType);

    const results = await Promise.all(
      userTypes.map(async (type) => {
        const [dayCount, weekCount, monthCount, totalCount] = await Promise.all(
          [
            this.userModel.countDocuments({
              userType: type,
              createdAt: { $gte: lastDayStart.toDate(), $lte: today.toDate() },
            }),
            this.userModel.countDocuments({
              userType: type,
              createdAt: { $gte: lastWeekStart.toDate(), $lte: today.toDate() },
            }),
            this.userModel.countDocuments({
              userType: type,
              createdAt: {
                $gte: lastMonthStart.toDate(),
                $lte: today.toDate(),
              },
            }),
            this.userModel.countDocuments({ userType: type }),
          ],
        );

        return {
          userType: type,
          lastDay: dayCount,
          lastWeek: weekCount,
          lastMonth: monthCount,
          total: totalCount,
        };
      }),
    );

    const data = results.reduce(
      (acc, curr) => {
        acc[curr.userType] = {
          lastDay: curr.lastDay,
          lastWeek: curr.lastWeek,
          lastMonth: curr.lastMonth,
          total: curr.total,
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    return serviceResponse({
      message: 'User count by type fetched successfully',
      data,
    });
  }

  async updateVerificationStatus(
    data:UpdateVerificationStatusDTO
  ): Promise<ObjectReturnType> {
    
    const updateFields: any = {
      [`verifications.${data.verificationType}`]: data.status,
     
    }
    if (data.status === 'rejected' && data.rejectionReason) {
      updateFields[`verifications.rejectionReason${data.verificationType}`] = data.rejectionReason;
    }

    const user = await this.userModel.findByIdAndUpdate(
      data.userID,
      { $set: updateFields },
      { new: true }, // Returns updated document
    );

    if (!user) {
      throw new NotFoundException(`User with ID ${data.userID} not found`);
    }

    return serviceResponse({
      message: `User verification ${status} successfully`,
      status: true,
    });
  }

  //get user notification with pagination
  async getNotification(
    params: { key: string; value: string },
    query: any,
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { skip = 0, limit = 0 } = query;

    const result = await this.activityLogModel
      .find({ [key]: value })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return serviceResponse({
      message: 'Success',
      data: result,
    });
  }

  //get all user ref list
  async getAllUserRefList(_id: string): Promise<ObjectReturnType> {
    const data = await this.userModel
      .find({ refBy: _id })
      .select('fullname email phone profileImage state refCode refBy userType type ')
      .populate(
        'refBy',
        'fullname email phone profileImage state refCode refBy referral userType type createdAt ',
      );
    return serviceResponse({
      message: 'Success',
      status: true,
      data,
    });
  }

  //get a rider average rating and all rating from rides
  async getUserRating(_id: string): Promise<ObjectReturnType> {
    const data =await this.rideModel.aggregate([
      {
        $match: {
          riderID: _id,
          rating: { $exists: true, $ne: null }
        }
      },
      {
        $project: {
          rideId: "$_id",
          rating: "$rating.rating",
          feedback: "$rating.feedback",
          userID: "$rating.userID",
          date: "$rating.date"
        }
      },
      {
        $addFields: {
          // Convert userID to ObjectId if it's not already one
          convertedUserID: { $toObjectId: "$userID" }
        }
      },
      {
        $lookup: {
          from: 'usermodels',
          localField: 'convertedUserID',
          foreignField: '_id',
          as: 'userInfo'
          
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true // Optional: set to false if only matched users should be shown
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          ratings: {
            $push: {
              rideId: "$rideId",
              rating: "$rating",
              feedback: "$feedback",
              userID: "$userID",
              date: "$date",
              userInfo: {
                id: "$userInfo._id",
                email: "$userInfo.email",
                fullname: "$userInfo.fullname",
                state: "$userInfo.state",
                phone: "$userInfo.phone",
                profileImage: "$userInfo.profileImage"
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageRating: 1,
          ratings: 1
        }
      }
    ]);
    
    return serviceResponse({
      message: 'Success',
      status: true,
      data,
    });
  }


 
 // Get riders by highest average rating (from embedded ratings in rides)
 async getRidersByRating(query:{limit: number ,state:string}): Promise<ObjectReturnType> {
  let { limit = 10,state } = query;
  limit=Number(limit)
  const data = await this.rideModel.aggregate([
    {
      $match: {
        riderID: { $exists: true, $ne: null },
        rating: { $exists: true, $ne: null },
        state:state
      }
    },
    {
      $group: {
        _id: "$riderID",
        averageRating: { $avg: "$rating.rating" },
        totalRatings: { $sum: 1 },
        latestRide: { $max: "$createdAt" }
      }
    },
    {
      $sort: { averageRating: -1 } // Sort by highest rating first
    },
    {
      $limit: limit
    },
    {
      $addFields: {
        // Convert riderID to ObjectId if it's not already one
        convertedRiderID: { $toObjectId: "$_id" }
      }
    },
    {
      $lookup: {
        from: 'usermodels',
        localField: 'convertedRiderID', // This is the field in the rides collection
        foreignField: '_id', // Join on the user's unique id field
        as: 'riderInfo'
      }
    },
    {
      $unwind: {
        path: "$riderInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        riderId: "$_id",
        averageRating: 1,
        totalRatings: 1,
        latestRide: 1,
        riderInfo: {
          _id: "$riderInfo._id",
          fullname: "$riderInfo.fullname",
          email: "$riderInfo.email",
          profileImage: "$riderInfo.profileImage",
          userType: "$riderInfo.userType",
          // Include other rider fields you might need
          vehicle: "$riderInfo.vehicle"
        }
      }
    }
  ]);
  
  return serviceResponse({
    message: 'Success',
    status: true,
    data
  });
}


// markAllUserNotificationAsRead
  async markAllUserNotificationAsRead(userID: string): Promise<ObjectReturnType> {
    const result = await this.activityLogModel.updateMany(
      { userID, isRead: false },
      { $set: { isRead: true } }
    );
    return serviceResponse({
      message: 'All notifications marked as read',
      status: true,
      data: result,
    });
  }
  
  //get unread user notification count
  async getUnreadNotificationCount(userID: string): Promise<ObjectReturnType> {
    const count = await this.activityLogModel.countDocuments({
      userID,
      isRead: false,
    });
    return serviceResponse({
      message: 'Unread notification count fetched successfully',
      status: true,
      data: { count },
    });
  }
  
}
