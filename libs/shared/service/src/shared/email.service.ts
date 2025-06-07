import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface SendMailInterface {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class SendMailService {
  constructor(private mailService: MailerService) {}

  async sendMail({ from, to, subject, html, text }: SendMailInterface) {
    const data = {
      from: from || 'emmanuel@jamfortetech.com',
      to,
      subject,
      text,
      html,
    };
    try {
      this.mailService.sendMail(data).catch((e) => {
        console.log('SmS failed');
      });
    } catch (error) {}
  }
}
