import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SmsService } from './sms.service';
import { SettingsModel, SettingsDoc, UserModel, UserDoc } from '@app/schema';
import { SendMailService } from './email.service';

export interface AuthNotificationData {
  userID: string;
  email: string;
  fullname?: string;
  eventType: 'login' | 'register' | 'password_change' | 'kyc_update' | 'otp';
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
       this.sendEmailNotification(data);

      // Check if SMS is enabled in admin settings
      const smsSettings = await this.settingsModel.findOne();
     
      if (smsSettings?.smsNotification && (["login","register"].includes(data.eventType))) {
        // Get user phone number
        const user = await this.userModel.findById(data.userID).select('phone email username fullname');
     

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
      from:"Firstlane Multi Investment<noreply@firstlanemultinvestment.com>",
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
      otp: 'Your OTP Code',
    };
    return subjects[eventType] || 'Account Activity Alert';
  }

  private generateEmailContent(data: AuthNotificationData): string {
    const { eventType, fullname, eventDetails } = data;
    const displayName = fullname || 'User';
    const timestamp = new Date().toLocaleString();
    const current_year = new Date().getFullYear();
    const dashboard_link=""
    const templates = {
      login: `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login Alert</title>
    <style>
        body {
            margin: 0;
            font-family: 'Instrument Sans', Arial, sans-serif;
            background-color: #f5f6fa;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            border: 1px solid #e4e6f0;
        }

        .header {
            background-color: #3E4095;
            padding: 25px;
            text-align: center;
        }

        .header img {
            max-height: 45px;
        }

        .content {
            padding: 35px 30px;
            line-height: 1.7;
            color: #444;
        }

        h2 {
            color: #3E4095;
            margin-bottom: 15px;
            font-size: 22px;
        }

        p {
            margin-bottom: 16px;
            font-size: 15px;
        }

        .details-box {
            background: #f3f4ff;
            border-left: 4px solid #3E4095;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
        }

        .details-box strong {
            color: #3E4095;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 18px;
            background: #f2f2f2;
            border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }

            h2 {
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/dlwe80qj5/image/upload/v1759833513/logos/wqm1warlrhhn29dpjj0i.png" alt="Firstlane Logo" />
        </div>
        <div class="content">
            <h2>New Login to Your Account</h2>
            <p>Hi ${displayName},</p>
            <p>We detected a new login to your <strong>Firstlane Multi Investment Limited</strong> account.</p>

            <div class="details-box">
                <p><strong>Login Details:</strong><br>
                    Time: ${timestamp}}<br>
                    // Device: {{device_name}}<br>
                    // Location: {{location}}
                    </p>
            </div>

            <p>If this was you, you can safely ignore this message.</p>
            <p>If you don’t recognize this activity, please change your password immediately to secure your account.</p>
            <p style="margin-top:25px;">Your security is our top priority.<br>Thank you for choosing
                <strong>Firstlane</strong>.</p>
        </div>
        <div class="footer">
            &copy; ${current_year} Firstlane Multi Investment Limited. All rights reserved.
        </div>
    </div>
</body>

</html>
      `,
      register: `
       <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Firstlane Multi Investment Limited</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');

        body,
        table,
        td {
            font-family: 'Instrument Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: #f7f8fa;
            color: #333333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: #3E4095;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }

        .header img {
            width: 80px;
            margin-bottom: 10px;
        }

        .content {
            padding: 30px 25px;
            line-height: 1.6;
            font-size: 15px;
        }

        .content h2 {
            color: #3E4095;
            font-size: 22px;
            margin-top: 0;
        }

        .button {
            display: inline-block;
            background-color: #3E4095;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 500;
        }

        .footer {
            text-align: center;
            font-size: 13px;
            color: #999999;
            padding: 25px;
        }

        @media only screen and (max-width: 620px) {
            .content {
                padding: 20px 15px !important;
            }

            .header {
                padding: 25px 15px !important;
            }

            h2 {
                font-size: 20px !important;
            }
        }
    </style>
</head>

<body>
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table class="container" role="presentation" cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                        <td class="header">
                            <img src="https://res.cloudinary.com/dlwe80qj5/image/upload/v1759833513/logos/wqm1warlrhhn29dpjj0i.png" alt="Firstlane Logo" />
                            <h1 style="margin: 0; font-size: 22px;">Welcome to Firstlane</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h2>Hi ${displayName}</h2>
                            <p>
                                We’re excited to welcome you to <strong>Firstlane Multi Investment Limited</strong> —
                                a modern financial platform built to simplify the way you manage and grow your money.
                            </p>
                            <p>
                                With your Firstlane account, you can:
                            </p>
                            <ul style="margin: 0 0 15px 20px;">
                                <li>Access flexible personal and employee loan options</li>
                                <li>Explore curated investment opportunities</li>
                                <li>Finance assets with ease</li>
                                <li>Exchange foreign currencies securely and instantly</li>
                                <li>Manage all your transactions in one smart digital wallet</li>
                            </ul>
                            <p>
                                Your journey to financial freedom starts here. Take a moment to log in and explore your
                                dashboard.
                            </p>
                            <p style="text-align:center;">
                                <a href="${dashboard_link}" class="button">Go to Dashboard</a>
                            </p>
                            <p>
                                Welcome aboard,<br />
                                <strong>The Firstlane Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            © ${current_year} Firstlane Multi Investment Limited. All rights reserved.<br>
                            This is an automated message — please do not reply.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
      `,
      password_change: `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Change Notification</title>
    <style>
        body {
            margin: 0;
            font-family: 'Instrument Sans', Arial, sans-serif;
            background-color: #f5f6fa;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            border: 1px solid #e4e6f0;
        }

        .header {
            background-color: #3E4095;
            padding: 25px;
            text-align: center;
        }

        .header img {
            max-height: 45px;
        }

        .content {
            padding: 35px 30px;
            line-height: 1.7;
            color: #444;
        }

        h2 {
            color: #3E4095;
            margin-bottom: 15px;
            font-size: 22px;
        }

        p {
            margin-bottom: 16px;
            font-size: 15px;
        }

        .details-box {
            background: #f3f4ff;
            border-left: 4px solid #3E4095;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 25px;
        }

        .details-box strong {
            color: #3E4095;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 18px;
            background: #f2f2f2;
            border-top: 1px solid #e0e0e0;
        }

        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }

            h2 {
                font-size: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/dlwe80qj5/image/upload/v1759833513/logos/wqm1warlrhhn29dpjj0i.png" alt="Firstlane Logo" />
        </div>
        <div class="content">
            <h2>Your Password Was Changed</h2>
            <p>Hi ${displayName},</p>
            <p>We wanted to let you know that your <strong>Firstlane Multi Investment Limited</strong> account password
                was recently changed.</p>

            <div class="details-box">
                <p><strong>Change Details:</strong><br>
                    Time: ${timestamp}<br>
                    // Device: {{device_name}}<br>
                    // Location: {{location}}
                    </p>
            </div>

            <p>If this was you, no further action is needed.</p>
            <p>If you didn’t make this change, please reset your password immediately using the “Forgot Password” option
                on our website.</p>
            <p>For your protection, always use strong passwords and avoid sharing them with anyone.</p>
            <p style="margin-top:25px;">Stay secure,<br><strong>The Firstlane Security Team</strong></p>
        </div>
        <div class="footer">
            &copy; ${current_year} Firstlane Multi Investment Limited. All rights reserved.
        </div>
    </div>
</body>

</html>
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


        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KYC Status Update</title>
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
    .status-box {
      background-color: #f0f1ff;
      border-left: 4px solid #3E4095;
      padding: 10px 15px;
      margin: 20px 0;
      border-radius: 6px;
      font-weight: 500;
      color: #3E4095;
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
      KYC Status Update
    </div>
    <div class="content">
      <p>Hi <strong>${displayName}</strong>,</p>
      <p>We wanted to update you about the current status of your KYC (Know Your Customer) verification on <strong>Firstlane Multi Investment Limited</strong>.</p>
      
      <div class="status-box">
        Current Status: <strong>${eventDetails?.status}</strong>
      </div>

      <p>
        Here’s what this means:
      </p>
      <ul>
      ${eventDetails?.status === 'rejected' && eventDetails?.reason ? `<li><strong>Reason for Rejection:</strong> ${eventDetails.reason}</li>` : ''}
      ${eventDetails?.status==="pending"?'<li><strong>Pending Review</strong> — Your documents have been received and are being reviewed by our team.</li>':''}
      ${eventDetails?.status==="verified"?'<li><strong>Approved</strong> — Your KYC has been successfully verified. You now have full access to all platform features.</li>':''}
        
      
        </ul>

      <p>
        Completing your KYC ensures full access to features like loans, investments, and faster withdrawals.  
      </p>

      <p>Thank you for choosing <strong>Firstlane</strong> — where your growth and security come first.</p>
    </div>

    <div class="footer">
      © ${current_year} Firstlane Multi Investment Limited. All rights reserved.
    </div>
  </div>
</body>
</html>
      `,
      otp: `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Firstlane Verification Code</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
    body, table, td {
      font-family: 'Instrument Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    body {
      margin: 0; padding: 0; background-color: #f7f8fa; color: #333333;
    }
    .container {
      max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px;
      overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #3E4095; color: #ffffff; text-align: center; padding: 30px 20px;
    }
    .header img { width: 80px; margin-bottom: 10px; }
    .content { padding: 30px 25px; line-height: 1.6; font-size: 15px; }
    .content h2 { color: #3E4095; font-size: 22px; margin-top: 0; }
    .otp-box {
      display: inline-block; background-color: #f2f3ff; border: 1px dashed #3E4095;
      color: #3E4095; font-weight: 600; font-size: 28px; letter-spacing: 6px;
      padding: 15px 25px; border-radius: 8px; margin: 15px 0;
    }
    .footer {
      text-align: center; font-size: 13px; color: #999999; padding: 25px;
    }
    @media only screen and (max-width: 620px) {
      .content { padding: 20px 15px !important; }
      .header { padding: 25px 15px !important; }
      h2 { font-size: 20px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%">
    <tr>
      <td align="center" style="padding:30px 10px;">
        <table class="container" role="presentation" width="100%">
          <tr>
            <td class="header">
              <img src="https://res.cloudinary.com/dlwe80qj5/image/upload/v1759833513/logos/wqm1warlrhhn29dpjj0i.png" alt="Firstlane Logo" />
              <h1>Verification Code</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h2>Hello ${displayName},</h2>
              <p>To verify your Firstlane account, please enter the 6-digit code below. This helps us confirm that the email address you provided truly belongs to you.</p>
              <div style="text-align:center;">
                <div class="otp-box">${eventDetails?.otp}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>. If you didn’t request this verification, you can safely ignore this message.</p>
              <p>Thank you for joining <strong>Firstlane Multi Investment Limited</strong> — where finance meets simplicity.</p>
              <p><strong>The Firstlane Team</strong></p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              © ${current_year} Firstlane Multi Investment Limited. All rights reserved.<br>
              This is an automated message — please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
    const { eventType, fullname, eventDetails } = data;
    const displayName = fullname || 'User';
    const timestamp = new Date().toLocaleString();

    const templates = {
      otp: `Hello ${displayName}, your OTP code is ${eventDetails?.otp || '123456'}. It is valid for 5 minutes.`,
      login: `Hello ${displayName}, your account was accessed on ${timestamp}. If this wasn't you, contact support immediately.`,
      register: `Welcome ${displayName}! Your account was created successfully on ${timestamp}.`,
      password_change: `Hello ${displayName}, your password was changed on ${timestamp}. Contact support if this wasn't you.`,
      kyc_update: `Hello ${displayName}, your KYC status was updated on ${timestamp}${eventDetails?.status ? ` to ${eventDetails.status}` : ''}.`,
    };

    return templates[eventType] || `Hello ${displayName}, there was activity on your account on ${timestamp}.`;
  }
}