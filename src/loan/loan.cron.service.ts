import { Injectable, Logger, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  LoanModel,
  LoanDoc,
  UserModel,
  WalletModel,
  TransactionDoc,
  TransactionModel,
  SettingsDoc,
  SettingsModel,
} from "@app/schema";

import * as moment from "moment";
import {
  TransactionStatus,
  TransactionType,
  LoanStatus,
} from "@app/enum";
import {
  FlutterwaveService,
  TransactionNotificationService,
  NotificationService,
  SmsService,
  SendMailService,
} from "@app/service";

@Injectable()
export class LoanCronService {
  private readonly logger = new Logger(LoanCronService.name);

  constructor(
    @InjectModel(LoanModel.name)
    private readonly loanModel: Model<LoanModel>,
    @InjectModel(WalletModel.name)
    private readonly walletModel: Model<WalletModel>,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly transactionNotificationService: TransactionNotificationService,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    private readonly notificationService: NotificationService,
    private readonly smsService: SmsService,
    private readonly sendMailService: SendMailService,
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
  ) {}

  // Runs every day at 8 AM
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleLoanReminders() {
    this.logger.log("🔁 Running loan reminder cron job...");

    const loans = await this.loanModel.find({ status: { $nin: [LoanStatus.PAID, LoanStatus.REJECTED, LoanStatus.PENDING] } });
    
    const today = moment().startOf("day");

    for (const loan of loans) {
      const user = await this.userModel.findById(loan.userID);
      // Find the next pending payment
      const nextPayment = loan.payments.find((p) => p.status === "pending");

      if (!nextPayment) {
        // All paid -> mark loan as paid
        if (loan.status !== LoanStatus.PAID) {
          loan.status = LoanStatus.PAID;
          await loan.save();
          this.logger.log(`✅ Loan ${loan._id} marked as PAID`);
        }
        continue;
      }

      const paymentDate = moment(nextPayment.date).startOf("day");
      const daysUntilDue = paymentDate.diff(today, "days");

      // Check payment status
      if (daysUntilDue === 2) {
        // 🔔 Reminder: 2 days before payment
        this.sendReminder(loan.userID, loan._id.toString(), paymentDate, nextPayment.amount);
      } else if (daysUntilDue === 0) {
        // 🔔 Reminder: due today
        this.sendReminder(loan.userID, loan._id.toString(), paymentDate, nextPayment.amount, true);
        await this.processLoanRepayment(loan._id.toString(),  nextPayment, `${loan._id.toString()}-${loan.userID}-${moment().format("YYYYMMDDHHmmss")}`);
      } else if (daysUntilDue < 0) {
        // ⏰ Overdue: mark loan as overdue
      
          loan.status = LoanStatus.OVERDUE;
          await loan.save();
          await this.sendMailService.sendMail({
            to: user.email,
            subject: "Loan Payment Reminder",
            text: `Your ${loan.loanType} Loan of ${loan.amountRequested.toLocaleString()} is OVERDUE!`,
          })
           const settings = await this.settingsModel.findOne();
const pendingPayments = loan.payments.filter((p) => p.status === "pending");
    const totalLoanAmount = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

       await this.processLoanRepayment(loan._id.toString(),  totalLoanAmount, `${loan._id.toString()}-${loan.userID}-${moment().format("YYYYMMDDHHmmss")}`);
      // Send SMS notification if admin SMS settings are enabled
      if (settings?.smsNotification) {
        await this.smsService.sendSingleSMS(user.phone,
          `Your ${loan.loanType} Loan of ${loan.amountRequested.toLocaleString()} is OVERDUE!`,
        )
      }
      this.notificationService.notificationActivity({
        action: "overdue",
        entityType: "loan",
        entityID: loan._id.toString(),
        userID: loan.userID,
        playerIds:[user.playerId],
        details: `Your ${loan.loanType} Loan of ${loan.amountRequested.toLocaleString()} is OVERDUE!`,
      })
          this.logger.warn(`⚠️ Loan ${loan._id} is OVERDUE!`);
        }

      } 
     
    
  }

  private async sendReminder(
    userID: string,
    loanID: string,
    dueDate: moment.Moment,
    amount: number,
    isDueToday = false,
  ) {
    const formattedDate = dueDate.format("YYYY-MM-DD");
    const user =await this.userModel.findById(userID)
    const message = isDueToday
      ? `Your loan payment of ₦${amount.toLocaleString()} is due today (${formattedDate}).`
      : `Reminder: Your next loan payment of ₦${amount.toLocaleString()} is due on ${formattedDate}.`;
    await this.sendMailService.sendMail({
      to: user.email,
      subject: "Loan Payment Reminder",
      text: message,
    })
     const settings = await this.settingsModel.findOne();

      // Send SMS notification if admin SMS settings are enabled
      if (settings?.smsNotification) {
        await this.smsService.sendSingleSMS(user.phone,
          message,
        )
      }
      this.notificationService.notificationActivity({
        action: "reminder",
        entityType: "loan",
        entityID: loanID,
        userID,
        playerIds:[user.playerId],
        details: message,
      })
       
    this.logger.log(`📩 Reminder sent to user ${userID} for Loan ${loanID}: ${message}`);
  }

  /**
   * Handle loan repayment processing
   */
 async processLoanRepayment(
  loanId: string,
  payment: any,
  reference: string
) {
  try {

    console.log(payment)
    // 1️⃣ Fetch loan
    const loan = await this.loanModel.findById(loanId);
    if (!loan) throw new NotFoundException(`Loan with ID ${loanId} not found`);

    // 2️⃣ Fetch user and wallet
    const user = await this.userModel.findById(loan.userID);
    if (!user) throw new NotFoundException(`User not found for loan ${loanId}`);

    const userWallet = await this.walletModel.findOne({ userID: user._id });
    if (!userWallet)
      throw new NotFoundException(`User wallet not found for loan ${loanId}`);

    // 3️⃣ Fetch admin + admin wallet
    const adminUser = await this.userModel.findOne({ isSuperAdmin: true });
    if (!adminUser) {
      this.logger.error(`Admin user not found for loan repayment ${loanId}`);
      return;
    } 

    const adminWallet = await this.walletModel.findOne({
      userID: adminUser._id,
    });
    if (!adminWallet) {
      this.logger.error(`Admin wallet not found for loan repayment ${loanId}`);
      return;
    }

    // 4️⃣ Check available admin balance
    const wallet = await this.flutterwaveService.getAvailableBalance(
      user._id.toString()
    );
    if ((wallet?.data?.available_balance ?? 0) < payment.amount) {
      throw new Error("Insufficient  wallet balance");
    }

    // 5️⃣ Transfer from admin → user
    await this.flutterwaveService.walletToWalletTransfer({
      account_bank: "flutterwave",
      account_number: adminWallet.barter_id,
      amount:payment.amount,
      narration: `Loan repayment for ${loanId}`,
      reference,
      debit_subaccount:   userWallet.customerCode,
    });

    // 6️⃣ Update payment schedule
    const nextPendingPayment = loan.payments.find((p) => p.id === payment.id);

    if (nextPendingPayment) {
      if (payment.amount >= nextPendingPayment.amount) {
        nextPendingPayment.status = "paid";
        nextPendingPayment.paidAt = moment().toDate();
        this.logger.log(
          `💰 Payment ${nextPendingPayment.id} for loan ${loanId} marked as PAID`
        );
      }
    }
    loan.payments=loan.payments.map((p) => {
      if (p.id === nextPendingPayment.id) {
        return { ...p, ...nextPendingPayment };
      }
      return p;
    })
    
    // 7️⃣ Recalculate loan status
    const remainingPayments = loan.payments.filter(
      (p) => p.status === "pending"
    ).length;

    if (remainingPayments === 0) {
      loan.status = LoanStatus.PAID;
      this.logger.log(`✅ Loan ${loanId} fully repaid and marked as COMPLETED`);
    } 

    await loan.save();

    // 8️⃣ Record the repayment transaction
    await this.transactionModel.create({
      userID: loan.userID,
      amount:payment.amount,
      type: TransactionType.LOAN,
      status: TransactionStatus.PAID,
      reference,
      receiverAccountNumber: "",
      receiverBank: "",
      receiverName: "FirstLane Finance",
      senderName:
        user.fullname || `${user.firstname || ""} ${user.lastname || ""}`,
      senderAccountNumber: "",
      senderBank: "",
    });

    // 9️⃣ Send user notifications
    await this.transactionNotificationService.sendTransactionNotifications({
      userID: loan.userID,
      type: TransactionType.LOAN,
    amount:payment.amount,
      status: TransactionStatus.PAID,
      reference,
      receiverAccountNumber: "",
      receiverBank: "",
      receiverName: "FirstLane Finance",
      senderName:
        user.fullname || `${user.firstname || ""} ${user.lastname || ""}`,
      senderAccountNumber: "",
      senderBank: "",
    });

    await this.notificationService.notificationActivity({
      action: "Loan Repayment",
      entityType: "loan",
      entityID: loan._id.toString(),
      userID: loan.userID,
      details: `Your loan repayment of ₦${payment.amount.toLocaleString()} has been received.`,
      playerIds: [user.playerId || ""],
    });
  return {
        status: true,
        message: `Loan repayment processed successfully for ${loan._id}`,

      }
    this.logger.log(`🎉 Loan repayment processed successfully for ${loan._id}`);
  } catch (error) {
    this.logger.error(`❌ Error processing loan repayment for ${loanId}:`, error);
    throw new NotAcceptableException(error.message)
  }
}
async processFullLoanRepayment(
  loanId: string,
  payment: any,
  reference: string
) {
  try {
    console.log(payment);

    // 1️⃣ Fetch loan
    const loan = await this.loanModel.findById(loanId);
    if (!loan) throw new NotFoundException(`Loan with ID ${loanId} not found`);

    // 2️⃣ Fetch user and wallet
    const user = await this.userModel.findById(loan.userID);
    if (!user) throw new NotFoundException(`User not found for loan ${loanId}`);

    const userWallet = await this.walletModel.findOne({ userID: user._id });
    if (!userWallet)
      throw new NotFoundException(`User wallet not found for loan ${loanId}`);

    // 3️⃣ Fetch admin + admin wallet
    const adminUser = await this.userModel.findOne({ isSuperAdmin: true });
    if (!adminUser) {
      this.logger.error(`Admin user not found for full loan repayment ${loanId}`);
      return;
    }

    const adminWallet = await this.walletModel.findOne({
      userID: adminUser._id,
    });
    if (!adminWallet) {
      this.logger.error(`Admin wallet not found for full loan repayment ${loanId}`);
      return;
    }

    // 4️⃣ Filter pending payments and calculate total loan amount
    const pendingPayments = loan.payments.filter((p) => p.status === "pending");
    const totalLoanAmount = pendingPayments.reduce((acc, p) => acc + p.amount, 0);

    if (totalLoanAmount === 0) {
      throw new Error("There are no pending payments for this loan.");
    }

    // 5️⃣ Check available admin balance
    const wallet = await this.flutterwaveService.getAvailableBalance(
      user._id.toString()
    );
    if ((wallet?.data?.available_balance ?? 0) < totalLoanAmount) {
      throw new Error("Insufficient balance for full repayment");
    }

    // 6️⃣ Transfer from admin → user (Full repayment)
    await this.flutterwaveService.walletToWalletTransfer({
      account_bank: "flutterwave",
      account_number: adminWallet.barter_id,
      amount: totalLoanAmount,
      narration: `Full loan repayment for ${loanId}`,
      reference,
      debit_subaccount: userWallet.customerCode,
    });

    // 7️⃣ Mark all pending payments as 'paid'
    pendingPayments.forEach((payment) => {
      payment.status = "paid";
      payment.paidAt = moment().toDate();
      this.logger.log(
        `💰 Payment ${payment.id} for loan ${loanId} marked as PAID`
      );
    });

    // 8️⃣ Recalculate loan status
    loan.status = LoanStatus.PAID;
    this.logger.log(`✅ Loan ${loanId} fully repaid and marked as COMPLETED`);

    await loan.save();

    // 9️⃣ Record the repayment transaction
    await this.transactionModel.create({
      userID: loan.userID,
      amount: totalLoanAmount,
      type: TransactionType.LOAN,
      status: TransactionStatus.PAID,
      reference,
      receiverAccountNumber: "",
      receiverBank: "",
      receiverName: "FirstLane Finance",
      senderName:
        user.fullname || `${user.firstname || ""} ${user.lastname || ""}`,
      senderAccountNumber: "",
      senderBank: "",
    });

    // 🔟 Send user notifications
    await this.transactionNotificationService.sendTransactionNotifications({
      userID: loan.userID,
      type: TransactionType.LOAN,
      amount: totalLoanAmount,
      status: TransactionStatus.PAID,
      reference,
      receiverAccountNumber: "",
      receiverBank: "",
      receiverName: "FirstLane Finance",
      senderName:
        user.fullname || `${user.firstname || ""} ${user.lastname || ""}`,
      senderAccountNumber: "",
      senderBank: "",
    });

    await this.notificationService.notificationActivity({
      action: "Full Loan Repayment",
      entityType: "loan",
      entityID: loan._id.toString(),
      userID: loan.userID,
      details: `Your full loan repayment of ₦${totalLoanAmount.toLocaleString()} has been received.`,
      playerIds: [user.playerId || ""],
    });

    return {
      status: true,
      message: `Full loan repayment processed successfully for ${loan._id}`,
    };
    this.logger.log(`🎉 Full loan repayment processed successfully for ${loan._id}`);
  } catch (error) {
    this.logger.error(`❌ Error processing full loan repayment for ${loanId}:`, error);
    throw new NotAcceptableException(error.message);
  }
}


}