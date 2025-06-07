// src/sms/sms.service.ts
import { OTPDTO } from '@app/dto';
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly baseUrl = 'https://app.emisri.com';
  private readonly username = 'jamforte';
  private readonly apiId = 'k6YtmOXf'; // used as password
  private readonly accessToken = '5m]X5k|OLsHrRm_Hk97S7:DCWaUxd1do';
  private readonly senderId = 'GoVeloox';

  private getAuthHeaders() {
    const token = Buffer.from(`${this.username}:${this.apiId}`).toString('base64');
    return {
      Authorization: `Basic ${token}`,
      'X-Access-Token': "5m]X5k|OLsHrRm_Hk97S7:DCWaUxd1do",
      'Content-Type': 'application/json',
    };
  }

  async sendSingleSMS(destination: string, text: string) {
    try {
      const response = await axios.post(
  'https://app.emisri.com/API/SendBulkSMS',
  {
    source: 'GoVeloox',
    destination: destination,
    text: text,
    dataCoding: 0,
  },
  {
    auth: {
      username: this.username, // your Emisri username
      password: this.apiId     // your Emisri API ID (acts as password)
    },
    headers: {
      'X-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    },
  },
);
console.log(response.data)
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to send SMS', error.response?.status || 500);
    }
  }

  async sendBulkSMS(destinations: string[], text: string) {
    try {
      const body = {
        source: this.senderId,
        destination: destinations,
        text,
        dataCoding: 0,
      };

      const response = await axios.post(
        `${this.baseUrl}/API/SendBulkSMS`,
        body,
        { headers: this.getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to send bulk SMS', error.response?.status || 500);
    }
  }

  async generateMessage(data:OTPDTO) {
  const { code, duration, type } = data;
  switch (type) {
    case 'EmailVerification':
      return `Your verification code is ${code}. Use this to verify your email address. This code expires in ${duration} minutes.`;
    case 'PasswordReset':
      return `Reset your password using this code: ${code}. Do not share this with anyone. The code is valid for ${duration} minutes.`;
    case '2FA':
      return `Your 2FA login code is ${code}. Enter this to complete your secure sign-in. It will expire in ${duration} minutes.`;
    case 'DeliveryPin':
      return `Your delivery PIN is ${code}. Share this with the delivery agent to confirm receipt. It will expire in ${duration} minutes.`;
    default:
      throw new Error('Invalid message type');
  }
}
}
