import { SettingsDTO, UserDTO } from "@app/dto";
import {
  KycLevel,
  LoanStatus,
  UserInvestmentStatus,
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
} from "@app/schema";
import {
  FlutterwaveService,
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
    @InjectModel(FxModel.name) private fxModel: Model<FxDoc>,
    @InjectModel(CurrencyModel.name) private currencyModel: Model<CurrencyDoc>,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>,
    @InjectModel(WalletModel.name)
    private walletModel: Model<WalletDoc>,
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
    private flutterwaveService: FlutterwaveService,
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
       
        const transferData = {
          account_bank: userWallet.bankCode,
          account_number: userWallet.accountNumber,
          amount: loan.amountRequested,
          narration: `Loan approval for ${loan.amountRequested}`,
          reference: `LOAN_${loanId}_${Date.now()}`,

          debit_subaccount: adminWallet.customerCode,
        };

        const transferResponse = await this.flutterwaveService.walletToWalletTransfer(
          transferData
        );

        if (transferResponse.status !== "success") {
          return serviceResponse({
            message: "Transfer failed",
            status: false,
            data: transferResponse,
          });
        }
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
        { $match: { status: LoanStatus.APPROVED } },
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
            status: LoanStatus.APPROVED,
            createdAt: { $lt: startOfCurrentMonth },
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
      const settings = await this.settingsModel.findOneAndUpdate({
        _id: payload._id??"",
      },{...payload},{new: true, upsert: true});
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
      const settings = await this.settingsModel
        .find({})
       
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

 
}
