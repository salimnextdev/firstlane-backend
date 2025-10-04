import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SmsService } from './sms.service';
import { SettingsModel, SettingsDoc, UserModel, UserDoc } from '@app/schema';
import { SendMailService } from './email.service';

export interface AuthNotificationData {
  userID: string;
  email: string;
  username?: string;
  eventType: 'login' | 'register' | 'password_change' | 'kyc_update';
  eventDetails?: any;
}

@Injectable()
export class AuthNotificationService {
  constructor(
    private readonly sendMailService: SendMailService,
    private readonly smsService: SmsService,
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
  ) {}

  async sendAuthNotifications(data: AuthNotificationData): Promise<void> {
    try {
      // Always send email notification
      await this.sendEmailNotification(data);

      // Check if SMS is enabled in admin settings
      const smsSettings = await this.settingsModel.findOne();
     
      if (smsSettings?.smsNotification) {
        // Get user phone number
        const user = await this.userModel.findById(data.userID).select('phone');
        if (user?.phone) {
          await this.sendSmsNotification(data, user.phone);
        }
      }
    } catch (error) {
      console.error('Error sending auth notifications:', error);
    }
  }

  private async sendEmailNotification(data: AuthNotificationData): Promise<void> {
    const subject = this.getEmailSubject(data.eventType);
    const content = this.generateEmailContent(data);

    await this.sendMailService.sendMail({
      to: data.email,
      subject,
      html: content,
    });
  }

  private async sendSmsNotification(data: AuthNotificationData, phone: string): Promise<void> {
    const message = this.generateSmsContent(data);
    
    await this.smsService.sendSingleSMS(
      phone,
      message,
    );
  }

  private getEmailSubject(eventType: string): string {
    const subjects = {
      login: 'Login Alert - Your Account Was Accessed',
      register: 'Welcome! Your Account Has Been Created',
      password_change: 'Password Changed Successfully',
      kyc_update: 'KYC Status Update',
    };
    return subjects[eventType] || 'Account Activity Alert';
  }

  private generateEmailContent(data: AuthNotificationData): string {
    const { eventType, username, eventDetails } = data;
    const displayName = username || 'User';
    const timestamp = new Date().toLocaleString();

    const templates = {
      login: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login Alert</h2>
          <p>Hello ${displayName},</p>
          <p>Your account was accessed on ${timestamp}.</p>
          <p>If this wasn't you, please contact our support team immediately.</p>
          <p>Best regards,<br>Your Security Team</p>
        </div>
      `,
      register: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Platform!</h2>
          <p>Hello ${displayName},</p>
          <p>Your account has been successfully created on ${timestamp}.</p>
          <p>You can now access all our services and features.</p>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
      password_change: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Changed</h2>
          <p>Hello ${displayName},</p>
          <p>Your password was successfully changed on ${timestamp}.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Best regards,<br>Your Security Team</p>
        </div>
      `,
      kyc_update: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">KYC Status Update</h2>
          <p>Hello ${displayName},</p>
          <p>Your KYC status has been updated on ${timestamp}.</p>
          ${eventDetails?.status ? `<p><strong>New Status:</strong> ${eventDetails.status}</p>` : ''}
          ${eventDetails?.reason ? `<p><strong>Reason:</strong> ${eventDetails.reason}</p>` : ''}
          <p>Best regards,<br>The Compliance Team</p>
        </div>
      `,
    };

    return templates[eventType] || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Activity</h2>
        <p>Hello ${displayName},</p>
        <p>There was activity on your account on ${timestamp}.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;
  }

  private generateSmsContent(data: AuthNotificationData): string {
    const { eventType, username, eventDetails } = data;
    const displayName = username || 'User';
    const timestamp = new Date().toLocaleString();

    const templates = {
      login: `Hello ${displayName}, your account was accessed on ${timestamp}. If this wasn't you, contact support immediately.`,
      register: `Welcome ${displayName}! Your account was created successfully on ${timestamp}.`,
      password_change: `Hello ${displayName}, your password was changed on ${timestamp}. Contact support if this wasn't you.`,
      kyc_update: `Hello ${displayName}, your KYC status was updated on ${timestamp}${eventDetails?.status ? ` to ${eventDetails.status}` : ''}.`,
    };

    return templates[eventType] || `Hello ${displayName}, there was activity on your account on ${timestamp}.`;
  }
}