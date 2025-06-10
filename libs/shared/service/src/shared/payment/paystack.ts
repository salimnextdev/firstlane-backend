import {  UserDTO,  } from '@app/dto';
import { RideStatus } from '@app/enum';
import { RideDoc, RideModel, UserDoc, UserModel } from '@app/schema';
import {
  TransactionModel,
  TransactionDoc,
} from '@app/schema/shared/transaction.schema';
import { WalletModel, WalletDoc } from '@app/schema/shared/waller.schema';
import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as crypto from 'crypto';
import e from 'express';
import { Model } from 'mongoose';
@Injectable()
export class PaystackService {
  private readonly paystackSecretKey: string;
  private readonly logger = new Logger(PaystackService.name);
  constructor(
    @InjectModel(WalletModel.name) private walletModel: Model<WalletDoc>,
    @InjectModel(UserModel.name) private userModel: Model<UserDoc>,
    @InjectModel(RideModel.name) private rideModel: Model<RideDoc>,
    @InjectModel(TransactionModel.name)
    private transactionModel: Model<TransactionDoc>,
    configService: ConfigService,
  ) {
    this.paystackSecretKey = configService.get<string>('PAYSTACK_SECRET_KEY');
  }
  //paystack webhook
  async paystackWebhook(req: any, res: any) {
    try {
      console.log(req.rawBody);
      const dd = {
        event: 'charge.success',
        data: {
          id: 4964939117,
          domain: 'live',
          status: 'success',
          reference: '100004250514203455132756917535',
          amount: 10000,
          message: null,
          gateway_response: 'Approved',
          paid_at: '2025-05-14T20:35:02.000Z',
          created_at: '2025-05-14T20:35:02.000Z',
          channel: 'dedicated_nuban',
          currency: 'NGN',
          ip_address: null,
          metadata: {
            receiver_account_number: '9853476117',
            receiver_bank: 'Paystack-Titan',
            receiver_account_type: null,
            custom_fields: [Array],
          },
          fees_breakdown: { amount: '100', formula: null, type: 'paystack' },
          log: null,
          fees: 100,
          fees_split: null,
          authorization: {
            authorization_code: 'AUTH_59vi0sggrz',
            bin: '810XXX',
            last4: 'X428',
            exp_month: '04',
            exp_year: '2025',
            channel: 'dedicated_nuban',
            card_type: 'transfer',
            bank: 'OPay Digital Services Limited (OPay)',
            country_code: 'NG',
            brand: 'Managed Account',
            reusable: false,
            signature: null,
            account_name: null,
            sender_country: 'NG',
            sender_bank: 'OPay Digital Services Limited (OPay)',
            sender_bank_account_number: 'XXXXXX4428',
            sender_name: 'EMMANUEL UGBEDE OCHIGBO',
            narration: 'Transfer from EMMANUEL UGBEDE OCHIGBO',
            receiver_bank_account_number: '9853476117',
            receiver_bank: 'Paystack-Titan',
          },
          customer: {
            id: 273268807,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'emman@say.com',
            customer_code: 'CUS_fdbvgykro8jdkyh',
            phone: '+2348104944428',
            metadata: {},
            risk_action: 'default',
            international_format_phone: '+2348104944428',
          },
          plan: {},
          subaccount: {},
          split: {},
          order_id: null,
          paidAt: '2025-05-14T20:35:02.000Z',
          requested_amount: 10000,
          pos_transaction_data: null,
          source: null,
        },
      };
      // const hash = crypto
      //   .createHmac('sha512', this.paystackSecretKey)
      //   .update(req.rawBody)
      //   .digest('hex');

      // if (hash !== req.headers['x-paystack-signature']) {
      //   return res.status(401).send('Invalid signature');
      // }

      const event = req.body as typeof dd;
      const user = await this.userModel.findOne({
        'bankAccount.customerCode': event?.data?.customer?.customer_code,
      });

      await this.transactionModel.create({
        userID: user._id,
        email: event?.data?.customer?.email,
        customerCode: event?.data?.customer?.customer_code,
        balance: event?.data?.amount,
        currency: event?.data?.currency,
        status: event?.data?.status,
        reference: event?.data?.reference,
        amount: event?.data?.amount,
        message: event?.data?.message,
        sender_bank_account_number:
          event?.data?.authorization?.sender_bank_account_number,
        narration: event?.data?.authorization?.narration,
        sender_bank: event?.data?.authorization?.sender_bank,
        card_type: event?.data?.authorization?.card_type,
        type: event.event,
      });

      // if (event.event === 'transfer.success') {
      console.log('Funds received into dedicated account:', event?.data);
      // Add logic to credit user's wallet, notify, etc.
      // }

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      throw new NotAcceptableException(
        'Error processing webhook:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //create customer
  async createCustomer(userData: Partial<UserDTO>) {
    const { email, fullname, phone } = userData;
    const nameParts = fullname?.split(' ');
    const firstName = nameParts?.[0];
    const lastName = nameParts?.length > 1 ? nameParts.slice(1).join(' ') : '';
    try {
      const response = await axios.post(
        'https://api.paystack.co/customer',
        {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error creating customer:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //List Customer

  async listCustomers(perPage: number = 50, page: number = 1) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/dedicated_account?perPage=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error listing customers:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //Fetch Customer
  async fetchCustomer(customerCode: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/dedicated_account/requery?account_number=${customerCode}&provider_slug=${'wema-bank'}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error?.response?.data?.message || error?.message ||
          error)
      throw new NotAcceptableException(
        'Error fetching customer:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //Update Customer
  async updateCustomer(customerCode: string, userData: Partial<UserDTO>) {
    const { email, fullname, phone } = userData;
    const nameParts = fullname?.split(' ');
    const firstName = nameParts?.[0];
    const lastName = nameParts?.length > 1 ? nameParts.slice(1).join(' ') : '';
    try {
      const response = await axios.put(
        `https://api.paystack.co/customer/${customerCode}`,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error updating customer:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //delete Customer
  async deleteCustomer(accountNumber:string) {
    try {

        const response = await axios.delete(
        `https://api.paystack.co/dedicated_account/${accountNumber}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      // const response2 = await axios.delete(
      //   `https://api.paystack.co/customer/${customerCode}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${this.paystackSecretKey}`,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error deleting customer:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //get all bank
  async getAllBanks() {
    try {
      const response = await axios.get('https://api.paystack.co/bank', {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error fetching banks:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }
  //verify a bank account number
  async verifyAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error verifying account number:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }
  //Fetch Bank Providers
  async fetchBankProviders() {
    try {
      const response = await axios.get(
        'https://api.paystack.co/dedicated_account/available_providers',
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error fetching bank providers Reason: ' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //Assign Dedicated Virtual Account
  async assignDedicatedVirtualAccount(
    customerCode: string,
    preferredBank?: string,
  ) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/dedicated_account',
        {
          customer: customerCode,
          preferred_bank: preferredBank,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error assigning dedicated virtual account:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //Single-step account assignment
  async singleStepAccountAssignment(
    userData: any,
    preferredBank?: string,
  ) {
    if (
      userData?.middle_name === null ||
      userData?.middle_name === undefined ||
      userData.middle_name === ''
    ) {
      delete userData.middle_name;
    }

    try {
      const response = await axios.post(
        'https://api.paystack.co/dedicated_account/assign',
        {
          ...userData,

          preferred_bank: preferredBank,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = response.data;
      if (data?.status) {
        const customer1 = await axios.get(
          `https://api.paystack.co/customer/${userData.email}`,
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          },
        );
        let customer = customer1.data;
        console.log('customer', customer.data.dedicated_account?.bank.name);
        if (customer?.data?.dedicated_account) {
          const user = await this.userModel.findById(userData.userID);
          if (!user) {
            throw new NotFoundException('User not found');
          }
          const newCustomerCode = customer.data?.customer_code;
          const newBankAccount = {
            bankName: customer.data.dedicated_account?.bank.name,
            bankCode: customer.data.dedicated_account?.bank.id,
            accountName: customer.data.dedicated_account?.account_name,
            accountNumber: customer.data.dedicated_account?.account_number,
            customerCode: newCustomerCode,
            status: 'active',
          };

          

          await user.save();

          await this.walletModel.findOneAndUpdate(
            { email: userData.email },
            {
              userID: userData.userID,
              email: userData.email,
              accountName: customer.data.dedicated_account?.account_name,
              accountNumber: customer.data.dedicated_account?.account_number,
              bankName: customer.data.dedicated_account?.bank.name,
              bankCode: customer.data.dedicated_account?.bank.id,
              customerCode: customer.data?.customer_code,
              balance: 0,
              currency: 'NGN',
              status: 'active',
            },
            { new: true, upsert: true },
          );
        }

        return customer?.data?.dedicated_account ?? 'Something went wrong';
      }
    } catch (error) {
      console.log(
        'Error assigning dedicated virtual account:' + error?.message || error,
      );
      throw new NotAcceptableException(
        'Error assigning dedicated virtual account:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }
  // get transaction on a dedicated account
  //get transaction on a dedicated account
  async getTransactionOnDedicatedAccountByEmail(
    customerCode: string,
    perPage: number = 50,
    page: number = 1,
  ) {
    try {
      const response = await axios.get(`https://api.paystack.co/transaction?perPage=${perPage}&page=${page}
      `, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

  //  console.log(response.data)

   const result=   response.data.data.map((item:any) => {
    // console.log(item.customer)
        if (item.customer.email === customerCode) {
          return item
        }else{
          return null
        }
      });
      return {
        ...response.data,data:result.filter((item:any) => item !== null)
      };
    } catch (error) {
      throw new NotAcceptableException(
        'Error fetching transactions:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

   async getTransactionOnDedicatedAccountByCustomerCode(
    customerCode: string,
    perPage: number = 50,
    page: number = 1,
  ) {
    try {
      const response = await axios.get(`https://api.paystack.co/transaction?customer=${customerCode}&perPage=${perPage}&page=${page}
      `, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

  //  console.log(response.data)

   const result=   response.data.data
      return {
        ...response.data,data:result
      };
    } catch (error) {
      throw new NotAcceptableException(
        'Error fetching transactions:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }
  async getTransactionOnDedicatedAccounts(perPage: number = 50, page: number = 1) {
    try {
      const response = await axios.get(`https://api.paystack.co/transaction?perPage=${perPage}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error fetching transactions:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  //deposit test money to a dedicated account
  async transferFundsToDedicatedAccount(wallet: any) {
    try {
      const ride = await this.rideModel.findById(wallet.rideID);
      // console.log(ride)
      const recipientResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: wallet.type,
          name: wallet.accountName,
          account_number: wallet.accountNumber,
          bank_code: wallet.bank_code, // Bank code for GTBank
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const recipientData = recipientResponse.data;
      console.log(
        'recipientData',
        recipientData,
        recipientData.data.recipient_code,
      );

      const response = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: ride.bidPrice * 1, // Amount in kobo
          recipient: recipientData.data.recipient_code,
          currency: 'NGN',
          reason: wallet.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.rideModel.findByIdAndUpdate(wallet.rideID, {
        transferCode: response.data.data.transfer_code,
        reference:response.data.data.reference,
      });

      return response.data;
    } catch (error) {
      console.log(error?.response?.data?.message ||
          error,)
      throw new NotAcceptableException(
        'Error depositing fund:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }
  //finalize transfer
  async finalizeTransfer(otp: string, rideID: string) {
    const ride = await this.rideModel.findById(rideID);
    try {
      const response = await axios.post(
        'https://api.paystack.co/transfer/finalize_transfer',
        {
          transfer_code: ride.transferCode,
          otp: otp,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      await this.rideModel.findByIdAndUpdate(
        rideID,
        {
          isPaid: true,
          status: {
            status: RideStatus.COMPLETED,
            date: new Date(),
            'statusDate.completed': new Date(),
          },
        },
        { new: true },
      );

      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error finalizing transaction:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  async initializeTransaction(email: string, amount: number) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Amount in kobo
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error initializing transaction:' + error?.response?.data?.message || error?.message ||
          error,
      );
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new NotAcceptableException(
        'Error verifying transaction:' + error?.response?.data?.message || error?.message,
      );
    }
  }
}
