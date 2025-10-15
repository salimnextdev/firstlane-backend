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
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transaction Notification</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #495057; margin-top: 0;">Hello ${user.fullname} ,</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
            <h3 style="margin-top: 0; color: ${statusColor};">${transactionTypeText} ${statusText}</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 40%;">Transaction Type:</td>
                <td style="padding: 8px 0;">${transactionTypeText}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: ${statusColor};">₦${data.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${statusText.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Reference:</td>
                <td style="padding: 8px 0; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">${data.reference}</td>
              </tr>
              ${data.senderAccountNumber ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">From:</td>
                <td style="padding: 8px 0;">${data.senderAccountNumber} (${data.senderBank || 'N/A'})</td>
              </tr>
              ` : ''}
              ${data.receiverAccountNumber ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">To:</td>
                <td style="padding: 8px 0;">${data.receiverAccountNumber} (${data.receiverBank || 'N/A'})</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1565c0;">
              <strong>Note:</strong> If you did not initiate this transaction, please contact our support team immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6c757d; font-size: 14px; margin: 0;">
              Thank you for using our services!<br>
              Best regards,<br>
              <strong>FirstLane Team</strong>
            </p>
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