import { SettingsDTO, UserDTO } from "@app/dto";
import {
  KycLevel,
  LoanStatus,
  LoanType,
  TransactionStatus,
  TransactionType,
  UserInvestmentStatus,
  UserType,
  VerificationStatus,
} from "@app/enum";
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
  FxModel,
  FxDoc,
  CurrencyDoc,
  CurrencyModel,
  WalletDoc,
  WalletModel,
  SettingsSchema,
  SettingsDoc,
  SettingsModel,
  TransactionModel,
  TransactionDoc,
} from "@app/schema";
import {
  FlutterwaveService,
  getMetadata,
  NotificationService,
  ObjectReturnType,
  serviceResponse,
  TransactionNotificationService,
  AuthNotificationService,
} from "@app/service";
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as moment from "moment";
import { Model } from "mongoose";
// Define allowed timeframes for type safety
export type TimeFrame = "today" | "7d" | "30d" | "90d" | "360d";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(UserInvestmentModel.name)
    private userInvestmentModel: Model<UserInvestmentDoc>,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    @InjectModel(LoanModel.name) private loanModel: Model<LoanDoc>,
    @InjectModel(FxModel.name) private fxModel: Model<FxDoc>,
    @InjectModel(CurrencyModel.name) private currencyModel: Model<CurrencyDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    @InjectModel(WalletModel.name)
    private walletModel: Model<WalletDoc>,
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
    private flutterwaveService: FlutterwaveService,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
    private notificationActivity: NotificationService,
    private transactionNotificationService: TransactionNotificationService,
    private authNotificationService: AuthNotificationService
  ) { }

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

      // Send KYC status change notification
      await this.authNotificationService.sendAuthNotifications({
        userID: user._id.toString(),
        email: user.email,
        fullname: user.fullname,
        eventType: 'kyc_update',
        eventDetails: {
          status: status,
          notes: notes || '',
          verifiedAt: new Date().toISOString(),
        },
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
      if (status === LoanStatus.APPROVED) {
        const adminWallet = await this.walletModel
          .findOne({ userID: userData._id.toString() })
          .exec();
        const userWallet = await this.walletModel
          .findOne({ userID: loan.userID })
          .exec();
        if (!adminWallet || !userWallet) {
          return serviceResponse({
            message: "Coupon creator || user wallet not found",
            status: false,
          });
        }

        const wallet = await this.flutterwaveService.getAvailableBalance(
          userData._id.toString()
        );
        if ((wallet?.data?.available_balance ?? 0) < loan.amountRequested) {
          return serviceResponse({
            message: "Admin wallet balance is less than loan amount",
            status: false,
          });
        }
        const isVendor = loan.loanType === LoanType.ASSETFINANCE
        const transferData = {
          account_bank: isVendor ? loan.vendorBankCode : userWallet.bankCode,
          account_number: isVendor ? loan.vendorAccountNumber : userWallet.accountNumber,
          amount: loan.amountRequested,
          narration: `Loan approval for ${loan.amountRequested}`,
          reference: `LOAN_${loanId}_${Date.now()}`,

          debit_subaccount: adminWallet.customerCode,
        };
        let transferResponse: any = {}
        if (!isVendor) {
          transferResponse = await this.flutterwaveService.walletToWalletTransfer(
            transferData
          );
        }

        const transaction = await this.transactionModel.create({
          userID: loan.userID,
          amount: loan.amountRequested,
          reference: transferResponse?.data?.reference ?? `LOAN_${loanId}_${Date.now()}`,
          type: TransactionType.LOAN,
          status: TransactionStatus.COMPLETED,
          receiverBank: isVendor ? loan.vendorBankName : userWallet.bankName,
          receiverAccountNumber: isVendor ? loan.vendorAccountNumber : userWallet.accountNumber,
          senderBank: adminWallet.bankName,
          senderAccountNumber: adminWallet.accountNumber,
        });

        // Send transaction notifications for approved loan
        await this.transactionNotificationService.sendTransactionNotifications({
          type: transaction.type as TransactionType,
          amount: transaction.amount,
          userID: transaction.userID,
          reference: transaction.reference,
          status: transaction.status as TransactionStatus,
        });

        // if (transferResponse.status !== "success") {
        //   return serviceResponse({
        //     message: "Transfer failed",
        //     status: false,
        //     data: transferResponse,
        //   });
        // }
      }
      const updatedLoan = await this.loanModel.findByIdAndUpdate(
        loanId,
        {
          status,
          notes: notes ?? "",
          adminID: userData._id,
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

  async getUserInvestments(id: string, query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    try {
      let investments;
      if (id) {
        investments = await this.userInvestmentModel
          .findById(id)
          .populate("userID investmentID");
      } else {
        investments = await this.userInvestmentModel
          .find({})
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate("userID investmentID");
      }

      return serviceResponse({
        data: investments,
        message: "User investments retrieved successfully",
        status: true,
        metadata: await getMetadata({
          model: this.userInvestmentModel,
          query,
          querys: {},
        }),
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAdminStats(): Promise<ObjectReturnType> {
    try {
      const now = new Date();
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current totals
      const totalUsers = await this.userModel.countDocuments();
      const totalLoans = await this.loanModel.countDocuments();
      const totalActiveInvestments = await this.userInvestmentModel.countDocuments(
        {
          status: "active",
        }
      );
      const totalFxVolume = await this.fxModel.countDocuments({
        status: "completed",
      });

      // Last month totals (created before start of current month)
      const lastMonthUsers = await this.userModel.countDocuments({
        createdAt: { $lt: startOfCurrentMonth },
      });
      const lastMonthLoans = await this.loanModel.countDocuments({
        createdAt: { $lt: startOfCurrentMonth },
      });
      const lastMonthActiveInvestments = await this.userInvestmentModel.countDocuments(
        {
          status: "active",
          createdAt: { $lt: startOfCurrentMonth },
        }
      );
      const lastMonthFxVolume = await this.fxModel.countDocuments({
        status: "completed",
        createdAt: { $lt: startOfCurrentMonth },
      });

      // Calculate percentage changes
      const calculatePercentageChange = (
        current: number,
        previous: number
      ): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 100) / 100;
      };

      const usersChange = calculatePercentageChange(totalUsers, lastMonthUsers);
      const loansChange = calculatePercentageChange(totalLoans, lastMonthLoans);
      const activeInvestmentsChange = calculatePercentageChange(
        totalActiveInvestments,
        lastMonthActiveInvestments
      );
      const fxVolumeChange = calculatePercentageChange(
        totalFxVolume,
        lastMonthFxVolume
      );

      return serviceResponse({
        message: "Admin stats retrieved successfully",
        status: true,
        data: {
          totalUsers,
          totalLoans,
          totalActiveInvestments,
          totalFxVolume,
          monthlyChanges: {
            users: usersChange,
            loans: loansChange,
            activeInvestments: activeInvestmentsChange,
            fxVolume: fxVolumeChange,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAdminFinancialStats(): Promise<ObjectReturnType> {
    try {
      const now = new Date();
      const startOfCurrentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current period aggregations
      const totalLoansIssuedAgg = await this.loanModel.aggregate([
        { $match: { $or: [{ status: LoanStatus.APPROVED, }, { status: LoanStatus.PAID }, { status: LoanStatus.OVERDUE }] } },
        { $group: { _id: null, total: { $sum: "$amountRequested" } } },
      ]);
      const totalLoansIssued = totalLoansIssuedAgg[0]?.total || 0;

      const totalActiveInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          { $match: { status: UserInvestmentStatus.ACTIVE } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const totalActiveInvestments = totalActiveInvestmentsAgg[0]?.total || 0;

      const totalCompletedInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          { $match: { status: UserInvestmentStatus.COMPLETED } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const totalCompletedInvestments =
        totalCompletedInvestmentsAgg[0]?.total || 0;

      const totalPendingInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          { $match: { status: UserInvestmentStatus.PENDING } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const totalPendingInvestments = totalPendingInvestmentsAgg[0]?.total || 0;

      // Last month aggregations (created before start of current month)
      const lastMonthLoansIssuedAgg = await this.loanModel.aggregate([
        {
          $match: {
            $or: [{
              status: LoanStatus.APPROVED,
              createdAt: { $lt: startOfCurrentMonth },
            }, { status: LoanStatus.PAID, createdAt: { $lt: startOfCurrentMonth } }, { status: LoanStatus.OVERDUE, createdAt: { $lt: startOfCurrentMonth } }
            ]
          },
        },
        { $group: { _id: null, total: { $sum: "$amountRequested" } } },
      ]);
      const lastMonthLoansIssued = lastMonthLoansIssuedAgg[0]?.total || 0;

      const lastMonthActiveInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          {
            $match: {
              status: UserInvestmentStatus.ACTIVE,
              createdAt: { $lt: startOfCurrentMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const lastMonthActiveInvestments =
        lastMonthActiveInvestmentsAgg[0]?.total || 0;

      const lastMonthCompletedInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          {
            $match: {
              status: UserInvestmentStatus.COMPLETED,
              createdAt: { $lt: startOfCurrentMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const lastMonthCompletedInvestments =
        lastMonthCompletedInvestmentsAgg[0]?.total || 0;

      const lastMonthPendingInvestmentsAgg = await this.userInvestmentModel.aggregate(
        [
          {
            $match: {
              status: UserInvestmentStatus.PENDING,
              createdAt: { $lt: startOfCurrentMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]
      );
      const lastMonthPendingInvestments =
        lastMonthPendingInvestmentsAgg[0]?.total || 0;

      // Calculate percentage changes
      const calculatePercentageChange = (
        current: number,
        previous: number
      ): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 100) / 100;
      };

      const loansIssuedChange = calculatePercentageChange(
        totalLoansIssued,
        lastMonthLoansIssued
      );
      const activeInvestmentsChange = calculatePercentageChange(
        totalActiveInvestments,
        lastMonthActiveInvestments
      );
      const completedInvestmentsChange = calculatePercentageChange(
        totalCompletedInvestments,
        lastMonthCompletedInvestments
      );
      const pendingInvestmentsChange = calculatePercentageChange(
        totalPendingInvestments,
        lastMonthPendingInvestments
      );

      // Get FX volumes for current and last month
      const currentFxVolumes = await this.getFxVolumesByCurrencySimple({
        status: ["completed"],
      });

      const lastMonthFxVolumes = await this.getFxVolumesByCurrencySimple({
        status: ["completed"],
        dateTo: endOfLastMonth,
      });

      // Calculate FX volume changes by currency
      const calculateFxVolumeChanges = (current: any, previous: any) => {
        const changes = { buy: {}, sell: {} };

        ["buy", "sell"].forEach((type) => {
          const currentVolumes = current.fxVolumes[type] || {};
          const previousVolumes = previous.fxVolumes[type] || {};

          // Get all unique currencies
          const allCurrencies = new Set([
            ...Object.keys(currentVolumes),
            ...Object.keys(previousVolumes),
          ]);

          allCurrencies.forEach((currency) => {
            const currentVol = currentVolumes[currency] || 0;
            const previousVol = previousVolumes[currency] || 0;
            changes[type][currency] = calculatePercentageChange(
              currentVol,
              previousVol
            );
          });
        });

        return changes;
      };

      const fxVolumeChanges = calculateFxVolumeChanges(
        currentFxVolumes,
        lastMonthFxVolumes
      );

      return {
        message: "Admin financial stats retrieved successfully",
        status: true,
        data: {
          totalLoansIssued,
          totalPendingInvestments,
          totalCompletedInvestments,
          totalActiveInvestments,
          fxVolumesByCurrency: currentFxVolumes.fxVolumes,
          monthlyChanges: {
            loansIssued: loansIssuedChange,
            pendingInvestments: pendingInvestmentsChange,
            completedInvestments: completedInvestmentsChange,
            activeInvestments: activeInvestmentsChange,
            fxVolumesByCurrency: fxVolumeChanges,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFxVolumesByCurrencySimple(filters?: {
    userID?: string;
    status?: string[];
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    // Build match conditions
    const matchConditions: any = {};

    if (filters?.userID) {
      matchConditions.userID = filters.userID;
    }

    if (filters?.status) {
      matchConditions.status = { $in: filters.status };
    }

    if (filters?.dateFrom || filters?.dateTo) {
      matchConditions.createdAt = {};
      if (filters.dateFrom) {
        matchConditions.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        matchConditions.createdAt.$lte = filters.dateTo;
      }
    }

    // Get all currencies for lookup
    const currencies = await this.currencyModel.find({}).exec();
    const currencyMap = currencies.reduce((map, curr) => {
      map[curr._id.toString()] = curr.code;
      return map;
    }, {});

    // Get transactions
    const transactions = await this.fxModel.find(matchConditions).exec();

    const fxVolumes = { buy: {}, sell: {} };

    transactions.forEach((tx) => {
      const fromCurrencyCode = currencyMap[tx.fromCurrency.currencyID];
      const toCurrencyCode = currencyMap[tx.toCurrency.currencyID];

      // Add from currency volume
      if (fromCurrencyCode) {
        if (!fxVolumes[tx.type][fromCurrencyCode]) {
          fxVolumes[tx.type][fromCurrencyCode] = 0;
        }
        fxVolumes[tx.type][fromCurrencyCode] += tx.fromCurrency.value;
      }

      // Add to currency volume
      if (toCurrencyCode) {
        if (!fxVolumes[tx.type][toCurrencyCode]) {
          fxVolumes[tx.type][toCurrencyCode] = 0;
        }
        fxVolumes[tx.type][toCurrencyCode] += tx.toCurrency.value;
      }
    });

    return { fxVolumes };
  }

  // create setting/s
  async createSettings(payload: SettingsDTO): Promise<ObjectReturnType> {
    try {
      const settings = await this.settingsModel.findOneAndUpdate(
        {
          _id: payload._id ?? "",
        },
        { ...payload },
        { new: true, upsert: true }
      );
      return serviceResponse({
        message: "Settings created successfully",
        status: true,
        data: settings,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // get setting/s
  async getSettings(): Promise<ObjectReturnType> {
    try {
      const settings = await this.settingsModel.find({});

      if (!settings) {
        throw new NotFoundException("No settings found");
      }

      return serviceResponse({
        message: "Settings retrieved successfully",
        status: true,
        data: settings,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTopInvestmentReferrers(timeframe: TimeFrame, limit: number = 10) {
    const startDate = this.calculateStartDate(timeframe);
    const now = new Date();
    console.log({
      startDate,
      now,
      timeframe,
    });
    const pipeline = [
      // 1. Filter Investments by Date, Status, and existence of a Referrer
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          refBy: { $exists: true, $ne: null },
        },
      },

      // 2. Deduplicate: Group by Referrer AND Investor.
      {
        $group: {
          _id: {
            referrerId: "$refBy",
            investorId: "$userID",
          },

          totalInvestedByThisUser: { $sum: "$amount" },
        },
      },

      // 3. Aggregate: Group purely by Referrer now
      {
        $group: {
          _id: "$_id.referrerId", // The custom ID from UserModel
          // Count of unique investors
          referralCount: { $sum: 1 },

          // Sum of volume from those investors
          totalVolume: { $sum: "$totalInvestedByThisUser" },
        },
      },

      // 5. Limit: Take top N
      {
        $limit: limit,
      },
      {
        $addFields: {
          staffObjectId: {
            $cond: {
              if: { $type: "$_id" },
              then: { $toObjectId: "$_id" }, // Convert to ObjectId if it's a string
              else: "$_id", // Keep as is if already ObjectId
            },
          },
        },
      },

      // 6. Join: Get Referrer's profile details from UserModel
      {
        $lookup: {
          from: "usermodels", // Actual MongoDB collection name for UserModel
          localField: "staffObjectId", // The 'refBy' string form previous stage
          foreignField: "_id", // Matching custom 'id' in UserModel
          as: "referrerDetails",
        },
      },

      // 7. Unwind: $lookup returns an array, flatten it (should exist)
      {
        $unwind: {
          path: "$referrerDetails",
          preserveNullAndEmptyArrays: false, // Exclude if user not found (edge case)
        },
      },

      // // // 8. Project: Format final output cleanly
      {
        $project: {
          _id: 0,
          userId: "$_id",

          fullname: "$referrerDetails.fullname",
          email: "$referrerDetails.email",
          profileImage: "$referrerDetails.profileImage",
          referralCount: 1,
          totalVolume: 1,
        },
      },
    ];
    return serviceResponse({
      message: "Top referral investors retrieved successfully",

      status: true,
      data: await this.userInvestmentModel.aggregate(pipeline).exec(),
    });
  }

  async assignAdminPermissions(
    userId: string,
    permissions: string[],
    adminData: UserDTO
  ): Promise<ObjectReturnType> {
    try {
      if (!adminData.isSuperAdmin) {
        throw new BadRequestException("Only Super Admins can assign permissions");
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        {
          isAdmin: true,
          userType: UserType.ADMIN,
          permissions: permissions,
        },
        { new: true }
      );

      return serviceResponse({
        message: "Admin permissions assigned successfully",
        status: true,
        data: updatedUser,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllAdmins(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;
    try {
      const admins = await this.userModel
        .find({ isAdmin: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return serviceResponse({
        message: "Admins retrieved successfully",
        status: true,
        data: admins,
        metadata: await getMetadata({
          model: this.userModel,
          query,
          querys: { isAdmin: true },
        }),
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // --- Helper for Dates ---
  private calculateStartDate(timeframe: TimeFrame): Date {

    const m = moment().utc(); // Use UTC if your DB stores UTC
    switch (timeframe) {
      case "today":
        return m.startOf("day").toDate();
      case "7d":
        return m.subtract(7, "days").startOf("day").toDate();
      case "30d":
        return m.subtract(30, "days").startOf("day").toDate();
      case "90d":
        return m.subtract(90, "days").startOf("day").toDate();
      case "360d":
        return m.subtract(360, "days").startOf("day").toDate();
      default:
        return m.startOf("day").toDate();
    }
  }

  async getInvestmentsSortedByDueDate(query): Promise<any> {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const userPlans = await this.userInvestmentModel
      .find({ status: UserInvestmentStatus.ACTIVE })
      .populate("userID investmentID")
      .skip(skip)
      .limit(limit)
      .sort({ investmentDueDate: 1 })
      .exec();

    return serviceResponse({
      data: userPlans,
      message: "Investments retrieved successfully",
      status: true,
      metadata: await getMetadata({
        model: this.userInvestmentModel,
        query,
        querys: { status: UserInvestmentStatus.ACTIVE },
      }),
    });
  }

  async getUpcomingPayouts(query: any): Promise<ObjectReturnType> {
    const { limit = 10, page = 1, type } = query;
    const skip = (page - 1) * limit;

    try {
      let data = [];
      let total = 0;

      if (type === 'investment') {
        data = await this.userInvestmentModel
          .find({ status: UserInvestmentStatus.ACTIVE })
          .skip(skip)
          .limit(limit)
          .sort({ investmentDueDate: 1 })
          .populate("userID investmentID")
          .exec();
        total = await this.userInvestmentModel.countDocuments({ status: UserInvestmentStatus.ACTIVE });
      } else if (type === 'loan') {
        // Upcoming disbursements (requested and pending)
        data = await this.loanModel
          .find({ status: LoanStatus.PENDING })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: 1 })
          .populate("userID")
          .exec();
        total = await this.loanModel.countDocuments({ status: LoanStatus.PENDING });
      } else if (type === 'fx') {
        data = await this.fxModel
          .find({ status: 'pending' })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: 1 })
          .populate("userID")
          .exec();
        total = await this.fxModel.countDocuments({ status: 'pending' });
      } else {
        // Return all combined and sorted
        const [investments, loans, fxs] = await Promise.all([
          this.userInvestmentModel.find({ status: UserInvestmentStatus.ACTIVE }).limit(limit).sort({ investmentDueDate: 1 }).populate("userID investmentID").exec(),
          this.loanModel.find({ status: LoanStatus.PENDING }).limit(limit).sort({ createdAt: 1 }).populate("userID").exec(),
          this.fxModel.find({ status: 'pending' }).limit(limit).sort({ createdAt: 1 }).populate("userID").exec(),
        ]);

        data = [
          ...investments.map(i => ({ ...i.toObject(), payoutType: 'investment' })),
          ...loans.map(l => ({ ...l.toObject(), payoutType: 'loan' })),
          ...fxs.map(f => ({ ...f.toObject(), payoutType: 'fx' })),
        ]
          // .sort((a, b) => {
          //   const dateA = a.investmentDueDate || a.createdAt;
          //   const dateB = b.investmentDueDate || b.createdAt;
          //   return new Date(dateA).getTime() - new Date(dateB).getTime();
          // })
          .slice(0, limit);

        total = (await this.userInvestmentModel.countDocuments({ status: UserInvestmentStatus.ACTIVE })) +
          (await this.loanModel.countDocuments({ status: LoanStatus.PENDING })) +
          (await this.fxModel.countDocuments({ status: 'pending' }));
      }

      return serviceResponse({
        message: "Upcoming payouts retrieved successfully",
        status: true,
        data,
        metadata: {
          total,
          limit,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
