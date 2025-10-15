import { BankStatementDTO, NextOfKinDTO, UserDTO, VerificationsDTO } from "@app/dto";
import { KycLevel } from "@app/enum";
import {
  UserModel,
  UserDoc,
  RideModel,
  RideDoc,
  ActivityLogModel,
  ActivityLogDoc,
} from "@app/schema";
import {
  NotificationService,
  ObjectReturnType,
  serviceResponse,
} from "@app/service";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class KycService {
    private readonly logger = new Logger(KycService.name);
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService
  ) {}

   // Submit KYC information
  async submitKyc(
    userId: string,
    kycData: Partial<UserDTO>
  ): Promise<ObjectReturnType> {
    delete kycData.status;
    try {
      const user = await this.userModel.findByIdAndUpdate(userId,{
        profileImage: kycData.profileImage,
        dob: kycData.dob,
        "verifications.level": KycLevel.LEVEL1,
        "verifications.status": "pending",
        "verifications.isKycComplete": false,
        maritalStatus: kycData.maritalStatus,
        state: kycData.state,
        country: kycData.country,
        gender: kycData.gender,
        residentialAddress: kycData.residentialAddress,
        localGovernmentArea: kycData.localGovernmentArea,
    
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      return serviceResponse({
        message: "KYC information submitted successfully",
        status: true,
        data: user.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async submitKycLevel2(
    userId: string,
    kycData: Partial<VerificationsDTO>
  ): Promise<ObjectReturnType> {
    delete kycData.status;
    try {
      const user = await this.userModel.findByIdAndUpdate(userId,{
        "verifications.idNumber": kycData.idNumber,
        "verifications.idType": kycData.idType,
        "verifications.issueDate": kycData.issueDate,
        "verifications.expiryDate": kycData.expiryDate,
         "verifications.waterBill": kycData.waterBill,
          "verifications.utilityBill": kycData.utilityBill,
        "verifications.bvn": kycData.bvn,
        "verifications.level": KycLevel.LEVEL2,
        
      },{new:true});
      if (!user) {
        throw new NotFoundException("User not found");
      }

   
    

      return serviceResponse({
        message: "KYC information submitted successfully",
        status: true,
        data: user.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
 async submitKycLevel3(
    userId: string,
    kycData: NextOfKinDTO
  ): Promise<ObjectReturnType> {
    
    try {
      const user = await this.userModel.findByIdAndUpdate(userId,{
        "verifications.nextOfKin": kycData,
        "verifications.level": KycLevel.LEVEL3,
      },{new:true});
      if (!user) {
        throw new NotFoundException("User not found");
      }
      return serviceResponse({
        message: "KYC information submitted successfully",
        status: true,
        data: user.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
 async submitKycLevel4(
    userId: string,
    kycData: BankStatementDTO[]
  ): Promise<ObjectReturnType> {
    
    try {
      const user = await this.userModel.findByIdAndUpdate(userId,{
        
        "verifications.level": KycLevel.LEVEL4,
        "verifications.isKycComplete": true,
        "verifications.kycCompletedAt": new Date(),
        "verifications.bankStatement": kycData,
      },{new:true});
      if (!user) {
        throw new NotFoundException("User not found");
      }

        this.notificationActivity.notificationActivity({
          action: "create",
          entityType: "KYC",
          entityID: user._id.toString(),
          userID: userId,
          details: `KYC information submitted for verification`,
          playerIds: [user?.playerId ?? ""],
        });
      return serviceResponse({
        message: "KYC information submitted successfully",
        status: true,
        data: user.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
 
  // Get KYC status
  async getKycStatus(userId: string): Promise<ObjectReturnType> {
    try {
      const user = await this.userModel
        .findById(userId)
        // .select("verifications");
      if (!user) {
        throw new NotFoundException("User not found");
      }

      return serviceResponse({
        message: "KYC status retrieved successfully",
        status: true,
        data: user.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
