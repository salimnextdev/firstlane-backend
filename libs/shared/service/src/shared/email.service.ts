import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface SendMailInterface {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class SendMailService {
  constructor(private mailService: MailerService) {}

  async sendMail({ from, to, subject, html, text }: SendMailInterface) {
    const data = {
      from:  from ||process.env.EMAIL_USERNAME|| 'emmanuel@jamfortetech.com',
      to,
      subject,
      text,
      html,
    };
    try {
      // console.log("data", data)
      this.mailService.sendMail(data).then((e) => {
        console.log('Email sent', );
      })
    } catch (error) {
      console.log('Email failed', error.message);
    }
  }
}
