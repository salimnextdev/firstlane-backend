import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import * as bcrypt from "bcrypt";
import { InjectModel } from "@nestjs/mongoose";
import {
  UserModel,
  UserDoc,
  AuthenticatorModel,
  AuthenticatorDoc,
  OTPDoc,
  OTPModel,
  AssignRoleModel,
  AssignRoleDoc,
  FeeDoc,
  FeeModel,
} from "@app/schema";
import { Model } from "mongoose";

import { JwtService } from "@nestjs/jwt";

import { authenticator } from "otplib";


import {
  ObjectReturnType,
  PaystackService,
  SendMailService,
  AuthNotificationService,
} from "@app/service";
import { BankAccountDTO, OTPDTO, UserDTO } from "@app/dto";
import { WalletModel, WalletDoc } from "@app/schema/shared/waller.schema";
import { FeeCategory } from "@app/enum";
import { SmsService } from "@app/service/shared/sms.service";
import { FlutterwaveService } from "@app/service/shared/payment/flutterwave";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
  
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(FeeModel.name) private feeModel: Model<FeeDoc>,
    private paystackService: PaystackService,
    @InjectModel(OTPModel.name) private otpModel: Model<OTPDoc>,
    @InjectModel(AssignRoleModel.name)
    private assignRoleModel: Model<AssignRoleDoc>,
    @InjectModel(WalletModel.name) private walletModel: Model<WalletDoc>,
    @InjectModel(AuthenticatorModel.name)
    private authenticatorModel: Model<AuthenticatorDoc>,
    private jwtService: JwtService,
    private flutterwaveService: FlutterwaveService,
    private smsService: SmsService,
    private sendMailService: SendMailService,
    private authNotificationService: AuthNotificationService
  ) {}

  async register(users: Partial<UserDTO>): Promise<any> {
    try {
      let checkUserRefId;

      if (users.useRefCode) {
        const user = await this.userModel.findOne({
          refCode: users.useRefCode,
        });

        if (!user) {
          throw new NotFoundException("Referral code not found");
        }
        checkUserRefId = user._id.toString();
      }

      const fee = await this.feeModel.findOne({
        category: FeeCategory.REFFERALPRICE,
      });

      const referral = {
        refBy: checkUserRefId,
        amount: fee?.fee,
        max: fee?.maxAmount,
      };
      const created = await this.userModel.create({
        ...users,
        refBy: checkUserRefId,
        referral,
      });

      const data = await this.otpModel.create({
        userID: created._id,
        type: "EmailVerification",
      });
     

      // this.sendMailService.sendMail({
      //   to: created.email,
      //   subject: "Email Code Verification",
      //   text: message,
      // });
 await this.authNotificationService.sendAuthNotifications({
        userID: created._id.toString(),
        email: created.email,
        fullname: created.fullname,
        eventType: 'otp',
        eventDetails: {
          otp: data.code,
        },
      });
     await this.flutterwaveService.createVirtualAccount({
        account_name: created.fullname,
        email: created.email,
        mobilenumber: created.phone,
      });
      return {
        message:
          "Registration successful, Please Proceed to Email Verification",
        userID: created._id,
      };
    } catch (error) {
      throw new NotAcceptableException(error.message);
    }
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.userModel
      .findOne({ email })
      .select([
        "email",
        "_id",
        "username",
        "id",
        "fullname",
        "password",
        "userType",
        "status",
        "emailStatus",
      ]);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch, password);
      if (isMatch) {
        if (user.status === "disabled") {
          throw new UnauthorizedException("User is disabled");
        }

        if (user.emailStatus !== "verified") {
          throw new UnauthorizedException("Email not verified");
        }
        console.log(user)
        // Send login notification
        await this.authNotificationService.sendAuthNotifications({
          userID: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
          eventType: 'login',
        });
        
        return this.getLoginToken(user);
      }
      throw new UnauthorizedException("Invalid Credentials");
    }

    throw new NotFoundException("No User Found");
  }

  async verifyEmail(userID: string, code: string): Promise<any> {
    const otp = await this.otpModel.findOne({
      userID,
      code,
      type: "EmailVerification",
    });

    if (!otp) {
      throw new NotFoundException("Invalid or expired code");
    }

    const user = await this.userModel.findByIdAndUpdate(
      userID,
      { emailStatus: "verified" },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }
 // Send registration notification
      await this.authNotificationService.sendAuthNotifications({
        userID: user._id.toString(),
        email: user.email,
        fullname: user.fullname,
        eventType: 'register',
      });
    await this.otpModel.findByIdAndDelete(otp._id);

    return {
      message: "Email verified successfully",
      data: user,
    };
  }

  getLoginToken(user: any) {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    console.log(payload);
    const access_token = this.jwtService.sign(payload, { expiresIn: "1d" });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: "30d",
      secret: this.config.get("JWT_SECRET2"),
    });
    return {
      message: "Login successful",
      status: true,
      data: user,
      access_token,
      refresh_token,
    };
  }
  async editProfile(body: UserDTO, userID: string) {
    delete body.email;
    delete body.id;
    delete body.isAdmin;
    delete body.isSuperAdmin;
    delete body.status;
    delete body.password;
    const user = await this.userModel.findByIdAndUpdate(userID, body, {
      new: true,
    });
    return {
      message: "User profile updated",
      data: user, // You may want to implement rotation here
    };
  }

  //add and remove bank details
  async addBankAccount(userID: string, bankAccount: any) {
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.bankAccount.push(bankAccount);

    await user.save();
    return {
      message: "Bank account added",
      data: user.bankAccount,
    };
  }

  async removeBankAccount(userID: string, accountNumber: string) {
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.bankAccount) {
      throw new NotFoundException("No bank account found");
    }
    const index = user.bankAccount.findIndex(
      (account) => account.accountNumber === accountNumber
    );
    if (index === -1) {
      throw new NotFoundException("Bank account not found");
    }
    user.bankAccount.splice(index, 1);
    await user.save();
    return {
      message: "Bank account removed",
      data: user.bankAccount,
    };
  }

  async getUserBanks (userID: string) {
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.bankAccount) {
      throw new NotFoundException("No bank account found");
    }
    return {
      message: "Bank account found",
      data: user.bankAccount,
    };
  }

  async editUserBanks (userID: string, bankAccount: BankAccountDTO) {
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.bankAccount) {
      throw new NotFoundException("No bank account found");
    }
    const index = user.bankAccount.findIndex(
      (account) => account.accountNumber === bankAccount.accountNumber
    );
    if (index === -1) {
      throw new NotFoundException("Bank account not found");
    }
    user.bankAccount[index] = bankAccount;
    await user.save();
    return {
      message: "Bank account updated",
      data: user.bankAccount,
    };
  }



  async refreshToken(token: string) {
    console.log(token);
    const payload = this.jwtService.verify(token);
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload1 = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };
    const newAccessToken = this.jwtService.sign(payload1, { expiresIn: "1d" });
    const refresh_token = this.jwtService.sign(payload1, {
      expiresIn: "30d",
    });
    return {
      access_token: newAccessToken,
      refresh_token, // You may want to implement rotation here
    };
  }
  async ssoGoogle(req: any): Promise<any> {
    const user = await this.userModel.findOne({ email: req.user.email });

    if (user) {
      
      return this.getLoginToken(user);
    } else {
      const created = await this.userModel.create({
        ...req.user,
        username: req.user.email,
        password: "",
      });

     
      return this.getLoginToken(created);
    }
  }

  async ssoFacebook(req: any): Promise<any> {
    const user = await this.userModel.findOne({ email: req.user.email });

    if (user) {
     
      return this.getLoginToken(user);
    } else {
      const created = await this.userModel.create({
        ...req.user,
        username: req.user.email,
        password: "",
      });

      
      return this.getLoginToken(created);
    }
  }

  async twoFactorAuthenticationLogin(body: any): Promise<any> {
    let isValid = false;
    if (body.token) {
      const secret = await this.authenticatorModel.findOne({
        userID: body.userID,
      });

      if (!secret) {
        throw new NotFoundException("User has not set authenticator");
      }

      isValid = authenticator.check(body.token, secret.secret);
    }
    const code = await this.otpModel.findOne({
      code: body.code,
      type: body.type,
      userID: body.userID,
    });

    isValid = code ? true : isValid;

    if (!isValid) { 
      throw new NotFoundException("Code not found or expired");
    }

    const userdata =  await this.userModel.findById(body.userID)
  const isUsermailVerified=userdata.emailStatus==="verified"
    if(!isUsermailVerified){
       // Send registration notification
      await this.authNotificationService.sendAuthNotifications({
        userID: userdata._id.toString(),
        email: userdata.email,
        fullname: userdata.fullname,
        eventType: 'register',
      });
       const user = await this.userModel.findByIdAndUpdate(
      body.userID,
      {
        emailStatus: "verified",
      },
      { new: true }
    );

    if (code) {
      await this.otpModel.findByIdAndDelete(code._id);
    }

    }
   
   

    return this.getLoginToken(userdata);
  }

  async sendTwoFactorAuthenticationMail(body: any): Promise<any> {
    const user = await this.userModel.findOne({
      $or: [{ _id: body.userID }, { email: body.email || body.userID }],
    });
    if (!user) {
      throw new NotFoundException("No User Found");
    }

    const data = await this.otpModel.create({
      userID: user._id.toString(),
      type: body.type,
    });
    const message = await this.smsService.generateMessage(data.toJSON() as any);

    this.authNotificationService.sendAuthNotifications({
      email:user.email,
      eventType:"otp",
      userID:user._id.toString(),
      eventDetails:{
        otp:data.code,
      },
      fullname:user.fullname
    })

    // this.sendMailService.sendMail({
    //   to: user.email,
    //   subject: body.type,
    //   text: message,
    // });

    return {
      message: "Code sent",
      data,
    };
  }

  async sendTwoFactorAuthenticationSms(body: any): Promise<any> {
    const user = await this.userModel.findOne({
      $or: [{ _id: body.userID }, { email: body.email || body.userID }],
    });
    if (!user) {
      throw new NotFoundException("No User Found");
    }

    const data = await this.otpModel.create({
      userID: user._id.toString(),
      type: body.type,
    });

    const message = await this.smsService.generateMessage(data.toJSON() as any);

    this.smsService.sendSingleSMS(user.phone, message);

    return {
      message: "Code sent",
      data,
    };
  }

  async setTwoFactorAuthenticator(body: any): Promise<any> {
    const isValid = authenticator.check(body.code, body.secret);
    if (!isValid) {
      throw new UnauthorizedException("Invalid Token");
    }

    const data = await this.authenticatorModel.create({
      userID: body.userID,
      secret: body.secret,
    });
    const user = await this.userModel.findById(body.userID);

    this.sendMailService.sendMail({
      to: user.email,
      subject: "Two Factor Authenticator",
      text: `${body.secret}`,
    });
    return {
      message: "authenticator set",
      data,
    };
  }

  async changePassword(
    userID: string,
    currentPassword: string,
    newPassword: string
  ): Promise<any> {
    // Step 1: Find the user by their user ID
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Step 2: Check if the current password matches the one in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const salt = await bcrypt.genSalt();
    // Step 3: Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userModel.findByIdAndUpdate(userID, {
      password: hashedPassword,
    });
 
    // Send password change notification
    await this.authNotificationService.sendAuthNotifications({
      userID: user._id.toString(),
      email: user.email,
      fullname: user.fullname,
      eventType: 'password_change',
    });

    return {
      message: "Password successfully updated",
    };
  }

  async deleteAccount(
    userID: string,
    email: string,
    reason: string
  ): Promise<any> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user._id.toString() !== userID) {
      throw new NotAcceptableException(
        "You are not allowed to delete this account"
      );
    }
    await this.userModel.findByIdAndDelete(userID);
    return {
      message: "Account successfully deleted",
      status: true,
    };
  }

  async verifyCode(
    type: string,
    code: string,
    
  ): Promise<any> {
    let isValid = false;
    // if (token) {
    //   const secret = await this.authenticatorModel.findOne({
    //     userID: userID,
    //   });

    //   if (!secret) {
    //     throw new NotFoundException('User has not set authenticator');
    //   }

    //   isValid = authenticator.check(token, secret.secret);
    // }
    const checkCode = await this.otpModel.findOneAndUpdate({
      code: code,
      type,
    },{status: "used"});

    isValid = checkCode ? true : isValid;

    if (!isValid) {
      throw new NotFoundException("Code not found or expired");
    }
  
    return {
      message: "Code verified successfully",
    };
  }
  async forgotPassword(
    token: string,
    code: string,
    newPassword: string
  ): Promise<any> {
    // let isValid = false;
    // if (token) {
    //   const secret = await this.authenticatorModel.findOne({
    //     userID: userID,
    //   });

    //   if (!secret) {
    //     throw new NotFoundException('User has not set authenticator');
    //   }

    //   isValid = authenticator.check(token, secret.secret);
    // }
    const checkCode = await this.otpModel.findOne({
      code: code,
      status: "used",
      type: "PasswordReset",
    });

    // isValid = checkCode ? true : isValid;

    if (!checkCode) {
      throw new NotFoundException("Code not found or expired");
    }

    // Step 1: Find the user by their user ID
    const user = await this.userModel.findById(checkCode.userID);
    await this.otpModel.findByIdAndDelete(checkCode._id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const salt = await bcrypt.genSalt();
    // Step 3: Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(checkCode.userID, {
      password: hashedPassword,
    });
    return {
      message: "Password successfully updated",
    };
  }
}
