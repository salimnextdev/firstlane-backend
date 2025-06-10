import { UserDTO } from '@app/dto';
import { KycLevel, VerificationStatus } from '@app/enum';
import { UserModel, UserDoc, RideModel, RideDoc, ActivityLogModel, ActivityLogDoc } from '@app/schema';
import { NotificationService, ObjectReturnType, serviceResponse } from '@app/service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
 private readonly logger = new Logger(AdminService.name);
 constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService,
  ) {}
    
      // Update KYC status (for admin use)
      async updateKycStatus(
        userId: string, 
        status: 'verified' | 'rejected', 
        adminData: UserDTO,
        notes?: string
      ): Promise<ObjectReturnType> {
        try {
          const user = await this.userModel.findById(userId);
          if (!user) {
            throw new NotFoundException('User not found');
          }
    
          if (!user.verifications) {
            throw new BadRequestException('No KYC information found for this user');
          }
    
          // Update verification status
          user.verifications.status = status;
          if (notes) {
            user.verifications.notes = notes;
          }
    
          await user.save();
    
          this.notificationActivity.notificationActivity({
            action: 'Verification Status Updated',
            entityType: 'KYC',
            entityID: user._id.toString(),
            userID: user._id.toString(),
            details: `KYC verification ${status}`,
            playerIds: [user?.playerId ?? ""],
          });
    
          return serviceResponse({
            message: `KYC ${status} successfully`,
            status: true,
            data: user.verifications,
          });
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }

      //get all users with KYC for kyc
      async getAllKycUsers(): Promise<ObjectReturnType> {
        try {
          const users = await this.userModel.find({
            'verifications.isKycComplete': true,
          }).select('verifications email firstName lastName phoneNumber  profileImage profileImage dob maritalStatus state country gender residentialAddress localGovernmentArea');
    
          if (!users ) {
            throw new NotFoundException('No KYC users found');
          }
    
          return serviceResponse({
            message: 'KYC users retrieved successfully',
            status: true,
            data: users,
          });
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }
   
}
