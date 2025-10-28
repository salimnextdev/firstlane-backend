import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendMailService } from './email.service';
import { SmsService } from './sms.service';
import { SettingsModel, SettingsDoc, UserModel, UserDoc } from '@app/schema';
import { TransactionType, TransactionStatus } from '@app/enum';

export interface TransactionNotificationData {
  userID: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  senderAccountNumber?: string;
  receiverAccountNumber?: string;
  senderBank?: string;
  receiverBank?: string;
  receiverName?: string;
  senderName?: string;
}

@Injectable()
export class TransactionNotificationService {
  private readonly logger = new Logger(TransactionNotificationService.name);

  constructor(
    private readonly sendMailService: SendMailService,
    private readonly smsService: SmsService,
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
  ) {}

  async sendTransactionNotifications(data: TransactionNotificationData): Promise<void> {
    try {
      // Get user details
      const user = await this.userModel.findById(data.userID);
      if (!user) {
        this.logger.error(`User not found for transaction notification: ${data.userID}`);
        return;
      }

      // Get admin settings
      const settings = await this.settingsModel.findOne();

      // Always send email notification
      await this.sendEmailNotification(user, data);

      // Send SMS notification if admin SMS settings are enabled
      if (settings?.smsNotification) {
        await this.sendSmsNotification(user, data);
      }
    } catch (error) {
      this.logger.error('Error sending transaction notifications:', error);
    }
  }

  private async sendEmailNotification(user: UserDoc, data: TransactionNotificationData): Promise<void> {
    try {
      const subject = this.getEmailSubject(data.type, data.status);
      const htmlContent = this.generateEmailContent(user, data);
      const from = data.type === TransactionType.LOAN ? "Firstlane Loan<loan@firstlanemultinvestment.com>" : TransactionType.INVESTMENT?"Firstlane Investment<investment@firstlanemultinvestment.com>":TransactionType.FX?"Firstlane FX<fx@firstlanemultinvestment.com>":null;
      await this.sendMailService.sendMail({
        to: user.email,
        subject,
        from,
        html: htmlContent,
      });

      this.logger.log(`Email notification sent for transaction ${data.reference} to ${user.email}`);
    } catch (error) {
      this.logger.error('Error sending email notification:', error);
    }
  }

  private async sendSmsNotification(user: UserDoc, data: TransactionNotificationData): Promise<void> {
    try {
      if (!user.phone) {
        this.logger.warn(`No phone number found for user ${user._id}`);
        return;
      }

      const message = this.generateSmsContent(user, data);

      await this.smsService.sendSingleSMS(
         user.phone,
        message,
      );

      this.logger.log(`SMS notification sent for transaction ${data.reference} to ${user.phone}`);
    } catch (error) {
      this.logger.error('Error sending SMS notification:', error);
    }
  }

  private getEmailSubject(type: TransactionType, status: TransactionStatus): string {
    const statusText = status === TransactionStatus.PAID ? 'Successful' : 
                      status === TransactionStatus.PENDING ? 'Pending' : 'Failed';
    
    switch (type) {
      case TransactionType.DEPOSIT:
        return `Wallet Funding ${statusText}`;
      case TransactionType.WITHDRAWAL:
        return `Withdrawal ${statusText}`;
      case TransactionType.TRANSFER:
        return `Transfer ${statusText}`;
      case TransactionType.LOAN:
        return `Loan Disbursement ${statusText}`;
      default:
        return `Transaction ${statusText}`;
    }
  }

  private generateEmailContent(user: UserDoc, data: TransactionNotificationData): string {
    const statusColor = data.status === TransactionStatus.PAID ? '#28a745' : 
    data.status === TransactionStatus.COMPLETED ? 'Successful' :
                       data.status === TransactionStatus.PENDING ? '#ffc107' : '#dc3545';
    
    const transactionTypeText = this.getTransactionTypeText(data.type);
    const statusText = data.status === TransactionStatus.PAID ? 'Successful' : 
                      data.status === TransactionStatus.COMPLETED ? 'Successful' :
                      data.status === TransactionStatus.PENDING ? 'Pending' : 'Failed';

    return `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transaction Notification</title>
  <style>
    body {
      font-family: 'Instrument Sans', Arial, sans-serif;
      background-color: #f5f6fa;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .header {
      background-color: #3E4095;
      color: white;
      text-align: center;
      padding: 20px;
      font-size: 20px;
      font-weight: bold;
    }
    .logo {
      display: block;
      margin: 0 auto 10px;
      width: 70px;
      height: 70px;
      object-fit: contain;
    }
    .content {
      padding: 30px;
      color: #333333;
      font-size: 15px;
      line-height: 1.7;
    }
    .txn-box {
      background-color: #f8f9ff;
      border-left: 4px solid ${statusColor};
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 6px;
      font-weight: 500;
      color: ${statusColor};
      text-transform: capitalize;
      word-break: break-word;
    }
    .details {
      margin-top: 10px;
      border-top: 1px solid #e6e6e6;
      padding-top: 10px;
    }
    .details p {
      margin: 4px 0;
      font-size: 14px;
    }
    .ref {
      display: inline-block;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
    .footer {
      background-color: #f7f7f9;
      text-align: center;
      padding: 15px;
      font-size: 13px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dlwe80qj5/image/upload/v1759833513/logos/wqm1warlrhhn29dpjj0i.png" alt="Firstlane Logo" class="logo" />
      Transaction Notification
    </div>

    <div class="content">
      <p>Hi <strong>${user.fullname}</strong>,</p>
      <p>
        This is to notify you of a recent transaction on your
        <strong>Firstlane Multi Investment Limited</strong> account.
      </p>

      <div class="txn-box">
        ${transactionTypeText} — <strong>${statusText}</strong>
      </div>

      <div class="details">
        <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
        <p><strong>Status:</strong> <span style="color:${statusColor}; font-weight:bold;">${statusText.toUpperCase()}</span></p>
        <p><strong>Reference:</strong> <span class="ref">${data.reference}</span></p>
        ${data.senderAccountNumber ? `
          <p><strong>From:</strong> ${data.senderAccountNumber} (${data.senderBank || 'N/A'})</p>
        ` : ''}
        ${data.receiverAccountNumber ? `
          <p><strong>To:</strong> ${data.receiverAccountNumber} (${data.receiverBank || 'N/A'})</p>
        ` : ''}
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Transaction Type:</strong> ${transactionTypeText}</p>
      </div>

      <p>
        For your safety, please review your account if you didn’t authorize this transaction.
      </p>

      <p>
        Thank you for trusting <strong>Firstlane</strong> to manage your financial activities — from investments to loans, and beyond.
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Firstlane Multi Investment Limited. All rights reserved.
    </div>
  </div>
</body>
</html>

    `;
  }

  private generateSmsContent(user: UserDoc, data: TransactionNotificationData): string {
    const transactionTypeText = this.getTransactionTypeText(data.type);
    const statusText = data.status === TransactionStatus.PAID ? 'successful' :
    data.status === TransactionStatus.COMPLETED ? 'Successful' :
                      data.status === TransactionStatus.PENDING ? 'pending' : 'failed';

    return `Hi ${user.firstname}, your ${transactionTypeText.toLowerCase()} of ₦${data.amount.toLocaleString()} was ${statusText}. Ref: ${data.reference}. Contact support if you didn't initiate this transaction.`;
  }

  private getTransactionTypeText(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Wallet Funding';
      case TransactionType.WITHDRAWAL:
        return 'Withdrawal';
      case TransactionType.TRANSFER:
        return 'Transfer';
      case TransactionType.LOAN:
        return 'Loan Disbursement';
      default:
        return 'Transaction';
    }
  }
}