import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';



import { GlobalMongooseModule } from './global-mongoose.module';

import { ThrottlerModule } from '@nestjs/throttler'

import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';

import { WebSocketModule } from './web-socket/web-socket.module';
import { CaslModule } from './casl/casl.module';
import { LibsModule } from 'libs/libs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoanModule } from './loan/loan.module';
import { SupportModule } from './support/support.module';
import { CouponModule } from './coupon/coupon.module';
import { FxModule } from './fx/fx.module';
import { AppController } from './app.controller';

import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [ 
    CaslModule,
    ScheduleModule.forRoot(),
   MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST') || 'jamfortetech.com',
          auth: {
            user: configService.get<string>('EMAIL_USERNAME') || 'emmanuel@jamfortetech.com',
            pass: configService.get<string>('EMAIL_PASSWORD') || 'Simple@1010*',
          },
        },
      }),
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    GlobalMongooseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // load: [configuration],
      // validationSchema,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),

    // BullModule.forRoot({
    //   redis: {
    //     host: 'localhost',  // Redis host (or use Redis Cloud URI)
    //     port: 6379,          // Redis port
    //   },
    // }),
    
    LibsModule,
    WebSocketModule,
    LoanModule,
    SupportModule,
    CouponModule,
    FxModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule  {
  
}
