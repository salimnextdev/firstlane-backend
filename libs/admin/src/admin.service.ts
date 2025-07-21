import { UserDTO } from "@app/dto";
import { KycLevel, LoanStatus, VerificationStatus } from "@app/enum";
import {
  UserModel,
  UserDoc,
  RideDoc,
  ActivityLogModel,
  ActivityLogDoc,
  LoanDoc,
  LoanModel,
  UserInvestmentDoc,
  UserInvestmentModel,
} from "@app/schema";
import {
  getMetadata,
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
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>,
    @InjectModel(LoanModel.name) private loanModel: Model<LoanDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService
  ) {}

  // Update KYC status (for admin use)
  async updateKycStatus(
    userId: string,
    status: "verified" | "rejected",
    adminData: UserDTO,
    notes?: string
  ): Promise<ObjectReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (!user.verifications) {
        throw new BadRequestException("No KYC information found for this user");
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          "verifications.status": status,
          "verifications.notes": notes ?? "",
          "verifications.verifiedAt": new Date(),
          "verifications.isKycComplete": status === "verified" ? true : false,
        },
        { new: true }
      );

      this.notificationActivity.notificationActivity({
        action: "Verification Status Updated",
        entityType: "KYC",
        entityID: user._id.toString(),
        userID: user._id.toString(),
        details: `KYC verification ${status}`,
        playerIds: [user?.playerId ?? ""],
      });

      return serviceResponse({
        message: `KYC ${status} successfully`,
        status: true,
        data: updatedUser.verifications,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //get all users with KYC for kyc
  async getAllKycUsers(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;
    try {
      const users = await this.userModel
        .find({
          "verifications.isKycComplete": true,
        })
        .select(
          "verifications email firstName lastName phoneNumber  profileImage profileImage dob maritalStatus state country gender residentialAddress localGovernmentArea"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();
      if (!users) {
        throw new NotFoundException("No KYC users found");
      }

      return serviceResponse({
        message: "KYC users retrieved successfully",
        status: true,
        data: users,
        metadata: await getMetadata({
          model: this.userModel,
          query,
          querys: {
            "verifications.isKycComplete": true,
          },
        }),
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //change loan status
  async changeLoanStatus(
    loanId: string,
    status: LoanStatus,
    userData: UserDTO,
    notes?: string
  ): Promise<ObjectReturnType> {
    try {
      const loan = await this.loanModel.findById(loanId);
      if (!loan) {
        throw new NotFoundException("Loan not found");
      }

      const updatedLoan = await this.loanModel.findByIdAndUpdate(
        loanId,
        {
          status,
          notes: notes ?? "",
          adminID: userData.id,
        },
        { new: true }
      );
      // if(status === LoanStatus.APPROVED){
      //   //send notification to user
      //   this.notificationActivity.notificationActivity({
      //     action: "Loan Status Updated",
      //     entityType: "Loan",
      //     entityID: loan._id.toString(),
      //     userID: loan.userID,
      //     details: `Loan ${status}`,
      //     playerIds: [
      //       // user?.playerId ?? ""
      //     ],
      //   });
      // }
      return serviceResponse({
        message: "Loan status updated successfully",
        status: true,
        data: updatedLoan,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserInvestments(userID: string): Promise<ObjectReturnType> {
    try {
      let investments;
      if (userID) {
        investments = await this.userInvestmentModel.find({userID});
      } else {
        investments = await this.userInvestmentModel.find({});
      }

      return serviceResponse({
        data: investments,
        message: "User investments retrieved successfully",
        status: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
