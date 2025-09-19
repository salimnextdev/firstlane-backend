import { Injectable } from '@nestjs/common';
import { SupportModel, SupportDoc, UserDoc, UserModel } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportDTO, UserDTO } from '@app/dto';
import { ObjectReturnType, serviceResponse, getMetadata, NotificationService } from '@app/service';
import { UserType } from '@app/enum';

@Injectable()
export class SupportService {
 constructor(
    @InjectModel(SupportModel.name)
    private supportModel: Model<SupportDoc>,
      private notificationActivity: NotificationService,
     @InjectModel(UserModel.name)
    private userModel: Model<UserDoc>,
  ){

 }
  async upset(
    createSupportDto: SupportDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    userData.userType === 'admin'
      ? (createSupportDto.adminID = userData._id)
      : (createSupportDto.userID = userData._id);
    const created = await this.supportModel.create({...createSupportDto,supportID:createSupportDto?.supportID});
  if(userData.userType !== 'admin'){
    const admins= await this.userModel.find({userType:UserType.ADMIN}).exec();
    
    for(const admin of admins){
         await this.notificationActivity.notificationActivity({
          entityType:"support",
          entityID:created._id.toString(),
        userID:admin._id.toString(),
        action:createSupportDto.supportID?"New Support Message":"New Support Ticket",
        details:createSupportDto.supportID?`A new support message has been sent by  ${userData.fullname}`:`A new support ticket has been created by  ${userData.fullname}`,
        playerIds:[admin.playerId],
        
      });
    }
  }else{
    const sup= await this.supportModel.findById(createSupportDto.supportID).exec();
    const user= await this.userModel.findById(sup.userID).exec();
     await this.notificationActivity.notificationActivity({
          entityType:"support",
          entityID:sup._id.toString(),
        userID:sup.userID,
        action:"Support Response",
        details:`Your support request has a new response from admin`,
        playerIds:[user.playerId],
        
      });
  }
   
    return serviceResponse({
      data: await created.save(),
      message: "success",

      status: true,
    });
  }

  // get all user or admin support where no supportID 
  async findUserOrAdminSupportList(
    query: any,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const filter = userData.userType === 'admin' ? {adminID: userData._id,supportID:null } : { userID: userData._id,supportID:null };

    const supports = await this.supportModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: supports,
      message: "Support tickets retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.supportModel,
        query,
        querys: filter,
      }),
    });
  }
  async findUserOrAdminSupportMessages(
    query: any,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    const { limit = 10, page = 1, supportID } = query;
    const skip = (page - 1) * limit;

   
    const supports = await this.supportModel
      .find({supportID:supportID})
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: supports,
      message: "Support messages retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.supportModel,
        query,
        querys: {supportID:supportID},
      }),
    });

  }
  

  async findAll(query: any): Promise<ObjectReturnType> {
   const { limit = 10, page = 1, supportID } = query;
    const skip = (page - 1) * limit;

   
    const supports = await this.supportModel
      .find({supportID: supportID})
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: supports,
      message: "Support messages retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.supportModel,
        query,
        querys: {supportID: supportID},
      }),
    });
  }

  async findOne(id: string): Promise<ObjectReturnType> {
    try {
      const plan = await this.supportModel.findById(id).populate("userID").exec();

      return serviceResponse({
        data: plan,
        message: "Support plan retrieved successfully",
        status: true,
      });
    } catch (error) {}
  }

  //find by any
  async findByAny(
    params: { key: string; value: string },
    query: any
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const plans = await this.supportModel
      .find({ [key]: value })
      .skip(skip)
      .limit(limit)
      .populate("userID")
      .sort({ createdAt: -1 })
      .exec();
    return serviceResponse({
      data: plans,
      message: "Support plans retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.supportModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //edit
  async update(
    id: string,
    updateSupportDto: SupportDTO,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updated = await this.supportModel
        .findByIdAndUpdate(id, updateSupportDto, {
          new: true,
        })
        .exec();

      if (!updated) {
        return serviceResponse({
          message: "Support plan not found",
          status: false,
        });
      }

      return serviceResponse({
        data: updated,
        message: "Support plan updated successfully",
        status: true,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }

    async delete(ids: string[], userData: UserDTO): Promise<ObjectReturnType> {
    try {
      
      const result = await this.supportModel.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount === 0) {
        return serviceResponse({
          message: "No support plans found to delete",
          status: false,
        });
      }

      return serviceResponse({
        message: `${result.deletedCount} support plans deleted successfully`,
        status: true,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }

}
