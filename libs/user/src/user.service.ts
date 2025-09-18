import {
  UserModel,
  ActivityLogDoc,
  ActivityLogModel,
  UserDoc,
  RideModel,
  RideDoc,
  FxModel,
  FxDoc,
  LoanDoc,
  LoanModel,
  UserInvestmentModel,
  UserInvestmentDoc,
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
  NotAcceptableException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { Action, UserType, KycLevel, VerificationStatus, UserInvestmentStatus, LoanStatus } from "@app/enum";

import { UserDTO } from "@app/dto";
// import { OrganizationAbilityFactory } from './organization-ability.factory';
import * as moment from "moment";
import { stat } from "fs";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(LoanModel.name) private loanModel: Model<LoanDoc>,
    @InjectModel(FxModel.name) private fxModel: Model<FxDoc>,
     @InjectModel(UserInvestmentModel.name) private userInvestmentModel: Model<UserInvestmentDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService
  ) {}

  async upset(user: UserDTO, userData: UserDTO): Promise<ObjectReturnType> {
    try {
      const created = await this.userModel.create(user);

      this.notificationActivity.notificationActivity({
        action: "create",
        entityType: "User",
        entityID: created._id.toString(),
        userID: userData?._id,
        details: `${userData?.fullname} created an user`,
        playerIds: [userData?.playerId ?? ""],
      });
      return serviceResponse({
        message: "created successfully",
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
      action: "updated",
      entityType: "User",
      entityID: updatedRole._id.toString(),
      userID: userData?._id,

      playerIds: [userData?.playerId ?? ""],
      details: `${userData?.fullname} updated an user`,
    });
    return serviceResponse({
      message: "updated successfully",
      data: updatedRole,
    });
  }

  async savePlayerId(body: { playerId: string; userID: string }) {
    const user = await this.userModel.findByIdAndUpdate(
      body.userID,
      { playerId: body.playerId },
      { new: true }
    );
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return serviceResponse({
      message: "Player ID saved successfully",
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
        message: "Success",
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findbyAny(
    params: { key: string; value: string },
    query: any
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const result = await this.userModel
      .find({ [key]: value })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!result.length) {
      throw new NotFoundException(value + " not found in field " + key);
    }

    return serviceResponse({
      message: "Success",
      data: result,
      metadata: await getMetadata({
        model: this.userModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  async findAll(query: any): Promise<ObjectReturnType> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    try {
      const data = await this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return serviceResponse({
        message: "Success",
        data,
        metadata: await getMetadata({ model: this.userModel, query, querys: {} }),
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
        message: "Success",
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
        message: "Success",
        data,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findRecentUsers(
    period: "day" | "week" | "month",
    query: any
  ): Promise<ObjectReturnType> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let startDate = moment().startOf("day"); // Start from today at 00:00
    let endDate = moment().endOf("day"); // End today at 23:59

    switch (period) {
      case "day":
        startDate = moment().subtract(1, "day").startOf("day"); // Yesterday 00:00
        endDate = moment().endOf("day"); // Today 23:59
        break;
      case "week":
        startDate = moment().subtract(7, "days").startOf("day"); // 7 days ago 00:00
        break;
      case "month":
        startDate = moment().subtract(1, "month").startOf("day"); // 1 month ago 00:00
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
      metadata: await getMetadata({
        model: this.userModel,
        query,
        querys: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      }),
    });
  }

  async countRecentUsers(): Promise<ObjectReturnType> {
    const today = moment().endOf("day");
    const lastDayStart = moment().subtract(1, "day").startOf("day");
    const lastWeekStart = moment().subtract(7, "days").startOf("day");
    const lastMonthStart = moment().subtract(1, "month").startOf("day");

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
          ]
        );

        return {
          userType: type,
          lastDay: dayCount,
          lastWeek: weekCount,
          lastMonth: monthCount,
          total: totalCount,
        };
      })
    );

    const data = results.reduce((acc, curr) => {
      acc[curr.userType] = {
        lastDay: curr.lastDay,
        lastWeek: curr.lastWeek,
        lastMonth: curr.lastMonth,
        total: curr.total,
      };
      return acc;
    }, {} as Record<string, any>);

    return serviceResponse({
      message: "User count by type fetched successfully",
      data,
    });
  }

  //get user notification with pagination
  async getNotification(
    params: { key: string; value: string },
    query: any
  ): Promise<ObjectReturnType> {
    const { key, value } = params;
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const result = await this.activityLogModel
      .find({ [key]: value })
      .populate("userID")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return serviceResponse({
      message: "Success",
      data: result,
      metadata: await getMetadata({
        model: this.activityLogModel,
        query,
        querys: { [key]: value },
      }),
    });
  }

  //get all user ref list
  async getAllUserRefList(_id: string): Promise<ObjectReturnType> {
    const data = await this.userModel
      .find({ refBy: _id })
      .select(
        "fullname email phone profileImage state refCode refBy userType type "
      )
      .populate(
        "refBy",
        "fullname email phone profileImage state refCode refBy referral userType type createdAt "
      );
    return serviceResponse({
      message: "Success",
      status: true,
      data,
    });
  }

  // markAllUserNotificationAsRead
  async markAllUserNotificationAsRead(
    userID: string
  ): Promise<ObjectReturnType> {
    const result = await this.activityLogModel.updateMany(
      { userID, isRead: false },
      { $set: { isRead: true } }
    );
    return serviceResponse({
      message: "All notifications marked as read",
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
      message: "Unread notification count fetched successfully",
      status: true,
      data: { count },
    });
  }

  // change userstatus
  async changeUserStatus(
    userID: string,
    status: string,
    userData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userID,
        { status },
        { new: true }
      );

      if (!updatedUser) {
        return serviceResponse({
          message: "User not found",
          status: false,
        });
      }

      this.notificationActivity.notificationActivity({
        action: "update",
        entityType: "User",
        entityID: updatedUser._id.toString(),
        userID: updatedUser?._id.toString(),
        details: `${updatedUser?.fullname} changed user status to ${status}`,
        playerIds: [updatedUser?.playerId ?? ""],
      });

      return serviceResponse({
        message: "User status updated successfully",
        status: true,
        data: updatedUser,
      });
    } catch (error) {
      return serviceResponse({
        message: error.message,
        status: false,
      });
    }
  }

  async getUserFinancialSnapshot(userID: string): Promise<ObjectReturnType> {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    };

    // ---------- CURRENT PERIOD ----------
    const currentLoansAgg = await this.loanModel.aggregate([
      {
        $match: {
          userID,
          status: LoanStatus.APPROVED
        }
      },
      {
        $group: {
          _id: null,
          totalRequested: { $sum: "$amountRequested" },
          totalRepaid: { $sum: "$amountRepaid" }
        }
      }
    ]);

    const currentInvestmentsAgg = await this.userInvestmentModel.aggregate([
      {
        $match: {
          userID,
          status: UserInvestmentStatus.ACTIVE
        }
      },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: "$amount" },
          totalAccruedInterest: { $sum: "$interestAccrued" }
        }
      }
    ]);

    const currentLoanRequested = currentLoansAgg[0]?.totalRequested || 0;
    const currentLoanRepaid = currentLoansAgg[0]?.totalRepaid || 0;
    const currentLoanBalance = currentLoanRequested - currentLoanRepaid;

    const currentInvestmentBalance = currentInvestmentsAgg[0]?.totalInvested || 0;
    const currentAccruedInterest = currentInvestmentsAgg[0]?.totalAccruedInterest || 0;

    // ---------- LAST MONTH ----------
    const lastMonthLoansAgg = await this.loanModel.aggregate([
      {
        $match: {
          userID,
          status: LoanStatus.APPROVED,
          createdAt: { $lt: startOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRequested: { $sum: "$amountRequested" },
          totalRepaid: { $sum: "$amountRepaid" }
        }
      }
    ]);

    const lastMonthInvestmentsAgg = await this.userInvestmentModel.aggregate([
      {
        $match: {
          userID,
          status: UserInvestmentStatus.ACTIVE,
          createdAt: { $lt: startOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: "$amount" },
          totalAccruedInterest: { $sum: "$interestAccrued" }
        }
      }
    ]);

    const lastLoanRequested = lastMonthLoansAgg[0]?.totalRequested || 0;
    const lastLoanRepaid = lastMonthLoansAgg[0]?.totalRepaid || 0;
    const lastLoanBalance = lastLoanRequested - lastLoanRepaid;

    const lastInvestmentBalance = lastMonthInvestmentsAgg[0]?.totalInvested || 0;
    const lastAccruedInterest = lastMonthInvestmentsAgg[0]?.totalAccruedInterest || 0;

    // ---------- CHANGES ----------
    const loanBalanceChange = calculatePercentageChange(currentLoanBalance, lastLoanBalance);
    const investmentBalanceChange = calculatePercentageChange(currentInvestmentBalance, lastInvestmentBalance);
    const accruedInterestChange = calculatePercentageChange(currentAccruedInterest, lastAccruedInterest);

    return serviceResponse({
      message: "User financial snapshot retrieved successfully",
      status: true,
      data: {
        loanBalance: currentLoanBalance,
        investmentBalance: currentInvestmentBalance,
        accruedInterest: currentAccruedInterest,
        monthlyChanges: {
          loanBalance: loanBalanceChange,
          investmentBalance: investmentBalanceChange,
          accruedInterest: accruedInterestChange
        }
      }
    });
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

async getUserLoanStats(userID: string): Promise<ObjectReturnType> {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    };

    // ---------- CURRENT ----------
    const currentLoanAgg = await this.loanModel.aggregate([
      {
        $match: {
          userID,
          status: LoanStatus.APPROVED
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$amountRequested" },
          totalRepaid: { $sum: "$amountRepaid" }
        }
      }
    ]);

    const currentCollected = currentLoanAgg[0]?.totalCollected || 0;
    const currentRepaid = currentLoanAgg[0]?.totalRepaid || 0;
    const currentDue = currentCollected - currentRepaid;

    // ---------- LAST MONTH ----------
    const lastMonthLoanAgg = await this.loanModel.aggregate([
      {
        $match: {
          userID,
          status: LoanStatus.APPROVED,
          createdAt: { $lt: startOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$amountRequested" },
          totalRepaid: { $sum: "$amountRepaid" }
        }
      }
    ]);

    const lastCollected = lastMonthLoanAgg[0]?.totalCollected || 0;
    const lastRepaid = lastMonthLoanAgg[0]?.totalRepaid || 0;
    const lastDue = lastCollected - lastRepaid;

    // ---------- CHANGES ----------
    const collectedChange = calculatePercentageChange(currentCollected, lastCollected);
    const repaidChange = calculatePercentageChange(currentRepaid, lastRepaid);
    const dueChange = calculatePercentageChange(currentDue, lastDue);

    return serviceResponse({
      message: "User loan stats retrieved successfully",
      status: true,
      data: {
        totalLoanCollected: currentCollected,
        totalLoanRepaid: currentRepaid,
        totalLoanDue: currentDue,
        monthlyChanges: {
          collected: collectedChange,
          repaid: repaidChange,
          due: dueChange
        }
      }
    });

  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


}
