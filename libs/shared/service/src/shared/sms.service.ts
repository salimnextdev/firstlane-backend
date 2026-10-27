// src/sms/sms.service.ts
import { OTPDTO } from "@app/dto";
import { Injectable, HttpException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class SmsService {
  private readonly baseUrl = "https://app.emisri.com";
  private readonly username = "jamforte";
  private  apiId ; // used as password
  private  accessToken ;
  private readonly senderId = "GoVeloox";
  constructor( configService: ConfigService) {
    this.accessToken = configService.get<string>('SMS_TOKEN');
    this.apiId = configService.get<string>('SMS_API_KEY');
  }

  private getAuthHeaders() {
    const token = Buffer.from(`${this.username}:${this.apiId}`).toString(
      "base64"
    );
    return {
      Authorization: `Basic ${token}`,
      "X-Access-Token": "5m]X5k|OLsHrRm_Hk97S7:DCWaUxd1do",
      "Content-Type": "application/json",
    };
  }

  async sendSingleSMS(destination: string, text: string) {
    try {
      destination=convertToInternational(destination);
      console.log(destination, text);

      const username = "firstlane";
      
      const senderID = "FIRSTLANE";
      const campaignname = "Firstlane";
      
      const finalDestination = destination || "2348104944428";
      const encodedText = text; // Safe encoding for URL

      const url = `https://app.emisri.com/API/SendSMS?username=${username}&apiId=${this.apiId}&json=True&destination=${finalDestination}&source=${senderID}&campaignname=${campaignname}&text=${encodedText}`;

      const headers = {
        "X-Access-Token": this.accessToken,
      };

      const response = await axios.get(url, { headers });

      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || "Failed to send SMS",
        error.response?.status || 500
      );
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
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || "Failed to send bulk SMS",
        error.response?.status || 500
      );
    }
  }

  async generateMessage(data: OTPDTO) {
    const { code, duration, type } = data;
    switch (type) {
      case "EmailVerification":
        return `Your verification code is ${code}. Use this to verify your email address. This code expires in ${duration} minutes.`;
      case "PasswordReset":
        return `Reset your password using this code: ${code}. Do not share this with anyone. The code is valid for ${duration} minutes.`;
      case "2FA":
        return `Your 2FA login code is ${code}. Enter this to complete your secure sign-in. It will expire in ${duration} minutes.`;
      case "DeliveryPin":
        return `Your delivery PIN is ${code}. Share this with the delivery agent to confirm receipt. It will expire in ${duration} minutes.`;
      case "AccountActivation":
        return `Activate your account using this code: ${code}. This code is valid for ${duration} minutes.`;
      case "Withdrawal":
        return `Your withdrawal code is ${code}. Use this to complete your transaction. The code expires in ${duration} minutes.`;
      default:
        throw new Error("Invalid message type");
    }
  }
}
function convertToInternational(phoneNumber:string) {
  if (phoneNumber.startsWith('0')) {
    return '234' + phoneNumber.slice(1);
  }
  return phoneNumber; // return as is if it doesn't start with '0'
}