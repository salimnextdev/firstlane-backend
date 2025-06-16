import { ActivityLogDoc, ActivityLogModel } from "@app/schema";
import { Model } from "mongoose";

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { NotificationGateway } from "./notification.gateway";

interface NotificationInterface {
  action: string;
  entityType: string;
  entityID: string;
  userID: string;
  details: string;
  playerIds: string[];
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    @InjectModel(ActivityLogModel.name)
    private activityLogModel: Model<ActivityLogDoc>
  ) {}

  private readonly oneSignalUrl = "https://onesignal.com/api/v1/notifications";
  private readonly appId = process.env.ONESIGNAL_APP_ID;
  private readonly apiKey = process.env.ONESIGNAL_API_KEY;

  async notificationActivity({
    entityType,
    userID,
    details,
    action,
    entityID,
    playerIds,
  }: NotificationInterface) {
    await this.activityLogModel.create({
      entityType,
      userID,
      details,
      action,
      entityID,
    });

    // Send real-time notification
    this.notificationGateway.sendNotification(userID.toString(), {
      action,
      entityType,
      entityID,
      details,
    });

    try {
      const payload = {
        app_id: this.appId,
        headings: { en: details },
        contents: { en: details },
        include_player_ids: playerIds,
      };

      const response = await axios.post(this.oneSignalUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${this.apiKey}`,
        },
      });

      console.log(`Notification sent: ${response.status}`);
    } catch (error) {
      console.log(error);
    }
  }

  private optionsBuilder(method: string, endpoint: string, data?: any) {
    return {
      method,
      url: `${this.oneSignalUrl}/${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.apiKey}`,
      },
      data: JSON.stringify(data),
    };
  }

  async createNotication(data: any) {
    const options = this.optionsBuilder("post", "notifications", data);
    try {
      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
