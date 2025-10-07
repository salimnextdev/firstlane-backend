import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoanStatus } from '@app/enum';
import { LoanModel, LoanDoc } from '@app/schema';
import { MailerService } from '@nestjs-modules/mailer';
import * as moment from 'moment';

@Injectable()
export class LoanReminderService {
  private readonly logger = new Logger(LoanReminderService.name);

  constructor(
    @InjectModel(LoanModel.name) private loanModel: Model<LoanDoc>,
    private mailService: MailerService, // You need a mailer service
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
   async handleLoanReminders() {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    this.logger.log('Running scheduled loan reminder task...');

    // 1. Loans due today
    await this.sendReminderForCondition(
      (dueDate) => moment(dueDate).isSame(today, 'day'),
      'Your loan is due today.'
    );

    // 2. Loans overdue
    await this.sendReminderForCondition(
      (dueDate) => moment(dueDate).isBefore(today, 'day'),
      'Your loan is overdue. Please pay immediately.'
    );

    // 3. Loans due tomorrow
    await this.sendReminderForCondition(
      (dueDate) => moment(dueDate).isSame(tomorrow, 'day'),
      'Reminder: Your loan will be due tomorrow.'
    );
  }

  private async sendReminderForCondition(condition: any, message: string) {
    const loans = await this.loanModel.find(condition).populate('userID');

    for (const loan of loans) {
      const user = loan.userID as any;
      if (!user?.email) continue;

      await this.mailService.sendMail({
        to: user.email,
        subject: 'Loan Payment Reminder',
        text: `${message} Loan ID: ${loan.id}`,
      });

      this.logger.log(`Reminder sent to ${user.email} for loan ${loan.id}`);
    }
  }
}
