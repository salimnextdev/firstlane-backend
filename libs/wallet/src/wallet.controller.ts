import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Response,
  Request,
  Headers,
  UseGuards,
  Patch,
  Res,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "@app/guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Wallets")
@ApiBearerAuth('access-token')
@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  // flutterwaveWebhook
  @Post("flutterwave-webhook")
  @ApiOperation({ summary: "Flutterwave webhook" })
  @ApiBody({ type: Object })
  async flutterwaveWebhook(@Request() req: any) {
    return await this.walletService.flutterwaveWebhook(req);
  }

  // createVirtualAccount
  @Post("create-virtual-account")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create virtual account" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        account_name: { type: "string", example: "John Doe" },
        email: { type: "string", example: "john@example.com" },
        mobilenumber: { type: "string", example: "08012345678" },
      },
    },
  })
  async createVirtualAccount(
    @Request() req,
    @Body() body: { account_name: string; email: string; mobilenumber: string }
  ) {
    return await this.walletService.createVirtualAccount(body);
  }

  // getAvailableBalance
  @Get("available-balance")
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "userID",
    description: "user _id",
    required: false,
    example: "PSA8D3C48391A6054680",
  })
  @ApiOperation({ summary: "Get available balance on a payout subaccount" })
  // @ApiParam({ name: "userID", description:"user _id", required: true ,example:"PSA8D3C48391A6054680" })
  async getAvailableBalance(@Request() req, @Query("userID") userID: string) {
    return await this.walletService.getAvailableBalance(
      userID || req.user._id.toString()
    );
  }
  //testDeposit
  @Post("test-deposit")

  @ApiOperation({ summary: "Test deposit to a user's wallet" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        amount: { type: "number", example: 100 },
        account_reference: { type: "string", example: "ACCT123" },
      },
    },
  })
  async testDeposit(
    @Request() req,
    @Body() body: {
      amount: number;
      account_reference:string
    }){
      return await this.walletService.testDeposit(body);
    }
    a
  
  

  // fetchTransactions
  @Get("fetch-transactions")
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "userID",
    description: "user _id",
    required: false,
    example: "PSA8D3C48391A6054680",
  })
  @ApiOperation({ summary: "Fetch transactions on a payout subaccount" })
  async fetchTransactions(@Request() req, @Query("userID") userID: string) {
    return await this.walletService.fetchTransactions(
      userID || req.user._id.toString()
    );
  }

  // Get all banks
  @Get("banks")
  @ApiOperation({ summary: "Get all banks" })
  async getAllBanks() {
    return await this.walletService.getAllBanks();
  }

  // verify a bank account number
  @Get("verify-account")
  @ApiOperation({ summary: "Verify a bank account number" })
  @ApiQuery({ name: "accountNumber", required: true })
  @ApiQuery({ name: "bankCode", required: true })
  async verifyAccountNumber(
    @Query("accountNumber") accountNumber: string,
    @Query("bankCode") bankCode: string
  ) {
    return await this.walletService.verifyAccountNumber(
      accountNumber,
      bankCode
    );
  }
}
