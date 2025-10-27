import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  UserInvestmentModel,
  UserInvestmentDoc,
  UserModel,
  WalletModel,
  TransactionDoc,
  TransactionModel,
} from "@app/schema";

import {
  TransactionStatus,
  TransactionType,
  UserInvestmentStatus,
} from "@app/enum";
import {
  FlutterwaveService,
  TransactionNotificationService,
  NotificationService,
} from "@app/service";

@Injectable()
export class InvestmentCronService {
  private readonly logger = new Logger(InvestmentCronService.name);

  constructor(
    @InjectModel(UserInvestmentModel.name)
    private readonly userInvestmentModel: Model<UserInvestmentModel>,
    @InjectModel(WalletModel.name)
    private readonly walletModel: Model<WalletModel>,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionNotificationService: TransactionNotificationService,
   
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    private readonly notificationService: NotificationService
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async calculateExpectedReturns() {
    this.logger.log("Running daily expected return calculation...");

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const investments = await this.userInvestmentModel.find({
      status: UserInvestmentStatus.ACTIVE,
    });

    for (const investment of investments) {
      const {
        amount,
        interestRate,
        duration,
        repaymentInterval,
        investmentDueDate,
      } = investment;

      // ✅ Mark as COMPLETED if due
      if (investmentDueDate && investmentDueDate <= now) {
        const wasNotCompleted =
          investment.status !== UserInvestmentStatus.COMPLETED;
        investment.status = UserInvestmentStatus.COMPLETED;
        this.logger.log(`Investment ${investment.id} marked as COMPLETED`);

        // Handle investment completion (credit wallet and send notifications)
        if (wasNotCompleted) {
          await this.handleInvestmentCompletion(investment);
        }
      }

      // ✅ Always recalculate full expected return (resilient to missed cron runs)
      const totalDays = this.getTotalDurationInDays(duration);
      if (!totalDays || !repaymentInterval) continue;

      const expectedReturn = this.calculateCompoundInterest({
        amount,
        interestRate,
        totalDays,
        repaymentInterval,
      });

      investment.expectedReturn = expectedReturn;
      investment.lastExpectedReturnUpdate = now;

      await investment.save();
      this.logger.log(
        `Updated expected return for investment ${investment.id}`
      );
    }

    this.logger.log("Finished daily expected return calculation.");
  }

  async refreshStatus(id: string): Promise<any> {
    const investment = await this.userInvestmentModel.findById(id);
    if (!investment) {
      throw new NotFoundException(`Investment with ID ${id} not found`);
    }

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const {
      duration,
      amount,
      interestRate,
      repaymentInterval,
      investmentDueDate,
    } = investment;

    // ✅ Mark as completed if investment is due
    if (investmentDueDate && investmentDueDate <= now) {
      const wasNotCompleted =
        investment.status !== UserInvestmentStatus.COMPLETED;
      investment.status = UserInvestmentStatus.COMPLETED;

      this.logger.log(`Marked investment ${investment.id} as COMPLETED`);

      // Handle investment completion (credit wallet and send notifications)
      if (wasNotCompleted) {
        await this.handleInvestmentCompletion(investment);
      }
    }

    // ✅ Always recalculate full expected return from scratch
    const totalDays = this.getTotalDurationInDays(duration);
    if (!totalDays || !repaymentInterval) return investment;

    const expectedReturn = this.calculateCompoundInterest({
      amount,
      interestRate,
      totalDays,
      repaymentInterval,
    });

    investment.expectedReturn = expectedReturn;
    investment.lastExpectedReturnUpdate = now;

    await investment.save();
    return {
      message: "Investment status refreshed successfully",
      data: investment,
      status: true,
    };
  }
  private getTotalDurationInDays(duration: string): number {
    const [value, unit] = duration.split(" ");
    const amount = parseInt(value, 10);
    if (unit === "days") return amount;
    if (unit === "months") return amount * 30;
    return 0;
  }

  private calculateCompoundInterest({
    amount,
    interestRate,
    totalDays,
    repaymentInterval,
  }: {
    amount: number;
    interestRate: number;
    totalDays: number;
    repaymentInterval: string;
  }): number {
    let compoundingPeriodsPerYear = 0;
    let compoundingPeriodDays = 0;

    switch (repaymentInterval.toLowerCase()) {
      case "daily":
        compoundingPeriodsPerYear = 365;
        compoundingPeriodDays = 1;
        break;
      case "weekly":
        compoundingPeriodsPerYear = 52;
        compoundingPeriodDays = 7;
        break;
      case "monthly":
        compoundingPeriodsPerYear = 12;
        compoundingPeriodDays = 30;
        break;
      case "quarterly":
        compoundingPeriodsPerYear = 4;
        compoundingPeriodDays = 90;
        break;
      case "annually":
        compoundingPeriodsPerYear = 1;
        compoundingPeriodDays = 365;
        break;
      case "30":
      case "60":
      case "90":
      case "180":
      case "365":
        compoundingPeriodDays = parseInt(repaymentInterval, 10);
        compoundingPeriodsPerYear = 365 / compoundingPeriodDays;
        break;
      default:
        const timeInYears = totalDays / 365;
        const simpleInterest = (amount * interestRate * timeInYears) / 100;
        return Math.round(simpleInterest * 100) / 100;
    }

    const periods = totalDays / compoundingPeriodDays;
    const ratePerPeriod = interestRate / (100 * compoundingPeriodsPerYear);

    const compoundAmount = amount * Math.pow(1 + ratePerPeriod, periods);
    const expectedReturn = compoundAmount - amount;

    return Math.round(expectedReturn * 100) / 100;
  }

  /**
   * Handle investment completion by crediting user wallet and sending notifications
   */
  private async handleInvestmentCompletion(
    investment: UserInvestmentModel
  ): Promise<void> {
    try {
      const _id = (investment as any)._id;
      this.logger.log(
        `Processing completion for investment ${investment.investmentCode}`
      );

      // Get user details
      const user = await this.userModel.findById(investment.userID);
      if (!user) {
        this.logger.error(
          `User not found for investment ${investment.investmentCode}`
        );
        return;
      }

      // Get user wallet
      const userWallet = await this.walletModel.findOne({
        userID: investment.userID,
      });

      if (!userWallet) {
        this.logger.error(
          `Wallet not found for user ${user.email} (investment ${investment.investmentCode})`
        );
        return;
      }

      // Calculate total amount to credit (principal + interest earned)
      const totalAmount = investment.amount + investment.expectedReturn;

      // Get admin wallet for the transfer (assuming admin user type or specific admin wallet)
      const adminUser = await this.userModel.findOne({ isSuperAdmin: true });
      if (!adminUser) {
        this.logger.error(
          `Admin user not found for investment completion ${investment.investmentCode}`
        );
        return;
      }

      const adminWallet = await this.walletModel.findOne({
        userID: adminUser._id,
      });
      if (!adminWallet) {
        this.logger.error(
          `Admin wallet not found for investment completion ${investment.investmentCode}`
        );
        return;
      }
      const wallet = await this.flutterwaveService.getAvailableBalance(
        adminUser._id.toString()
      );
      console.log(wallet?.data, totalAmount);
      if ((wallet?.data?.available_balance ?? 0) < totalAmount) {
        throw new Error("Insufficient balance");
      }
      // Perform wallet to wallet transfer from admin to user
      const transferResult = await this.flutterwaveService.walletToWalletTransfer(
        {
          account_bank: "flutterwave",
          account_number: userWallet.barter_id,
          amount: totalAmount,
          narration: `Investment completion payout for ${investment.investmentCode}`,
          reference: `INV_COMPLETE_${investment.investmentCode}_${Date.now()}`,
          debit_subaccount: adminWallet.customerCode,
        }
      );

      this.logger.log(
        `Successfully credited ${totalAmount} to user ${user.email} for investment ${investment.investmentCode}`
      );
      this.userInvestmentModel.findByIdAndUpdate(_id, {
        status: UserInvestmentStatus.COMPLETED,
        withdrawalDate: new Date(),
      })

      // Create transaction record
      await this.transactionModel.create({
        userID: investment.userID,
        amount: totalAmount,
        type: TransactionType.INVESTMENT,
        status: TransactionStatus.PAID,
        reference:
          transferResult.data?.reference ||
          `INV_COMPLETE_${investment.investmentCode}`,
        receiverAccountNumber: userWallet.accountNumber,
        receiverBank: userWallet.bankName,
        receiverName: userWallet.accountName,
        senderName: adminWallet.accountName,
        senderAccountNumber: adminWallet.accountNumber,
        senderBank: adminWallet.bankName,
      });
      // Send transaction notifications (email and SMS)
      await this.transactionNotificationService.sendTransactionNotifications({
        userID: investment.userID,
        type: TransactionType.INVESTMENT,
        amount: totalAmount,
        status: TransactionStatus.PAID,
        reference:
          transferResult.data?.reference ||
          `INV_COMPLETE_${investment.investmentCode}`,
        receiverAccountNumber: userWallet.accountNumber,
        receiverBank: userWallet.bankName,
        receiverName: userWallet.accountName,
        senderName: adminWallet.accountName,
        senderAccountNumber: adminWallet.accountNumber,
        senderBank: adminWallet.bankName,
      });

      // Send activity notification
      await this.notificationService.notificationActivity({
        action: "Investment Completed",
        entityType: "investment",
        entityID: _id.toString(),
        userID: investment.userID,
        details: `Your investment ${
          investment.investmentCode
        } has matured and ₦${totalAmount.toLocaleString()} has been credited to your wallet.`,
        playerIds: [user.playerId || ""],
      });

      this.logger.log(
        `All notifications sent for investment completion ${investment.investmentCode}`
      );
    } catch (error) {
      this.logger.error(
        `Error handling investment completion for ${investment.investmentCode}:`,
        error
      );
    }
  }
}
