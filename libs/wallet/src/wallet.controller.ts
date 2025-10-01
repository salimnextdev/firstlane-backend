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
import { PaymentRequestDTO, WalletService } from "./wallet.service";
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
@UseGuards(JwtAuthGuard)
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
        email: { type: "string", example: "john@example2.com" },
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
      
      },
    },
  })
  async testDeposit(
    @Request() req,
    @Body()
    body: {
      amount: number;
     
    }
  ) {
    return await this.walletService.testDeposit({...body,userID:req.user._id.toString()});
  }
  a;

  // fetchTransactions
  @Get("fetch-transactions")
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "userID",
    description: "user _id",
    required: false,
    example: "PSA8D3C48391A6054680",
  })
  @ApiQuery({
    name: "from",
    description: "from date",
    required: false,
    example: "2021-01-01",
  })
  @ApiQuery({
    name: "to",
    description: "to date",
    required: false,
    example: "2021-01-01",
  })
  @ApiQuery({
    name: "perPage",
    description: "number of transactions per page",
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: "page",
    description: "page number",
    required: false,
    example: 1,
  })
  @ApiOperation({ summary: "Fetch transactions on a payout subaccount" })
  async fetchTransactions(@Request() req, @Query("userID") userID: string) {
    return await this.walletService.fetchTransactions({
      userID: userID || req.user._id.toString(),
      from: req.query.from,
      to: req.query.to,
      perPage: req.query.perPage,
      page: req.query.page,
    });
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


  
  // withdrawFunds
  @Post("withdraw-funds")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Withdraw funds from a user's wallet" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        account_bank: { type: "string", example: "044" },
        account_number: { type: "string", example: "0690000031" },
        amount: { type: "number", example: 1000 },
        narration: { type: "string", example: "Withdrawal" },
        otp: { type: "string", example: "561465" },
      },
    },
  })
  async withdrawFunds(
    @Request() req,
    @Body() body: {
      account_bank: string;
      account_number: string;
      amount: number;
      narration?: string;
      otp:string
    }
  ) {
    return await this.walletService.withdrawFunds({ ...body, userID: req.user._id.toString() });
  }
// getTransferById
  @Get("transaction/:transferId")
  @ApiOperation({ summary: "Get transaction by ID" })
  @ApiParam({ name: "transferId", description: "Transfer ID", example: "FLW_REF_12345" })
  async getTransferById(@Param("transferId") transferId: string) {
    return await this.walletService.getTransferById(transferId);
  }

// initiateCheckout
@Post("fund-account")
@ApiOperation({ summary: "Initiate a payment to fund account" })
@ApiBody({
  schema: {
    type: "object",
    properties: {
      amount: { type: "number", example: 5000 },
      redirect_url: { type: "string", example: "https://example.com/redirect" },
    },
    required: ["amount", "redirect_url"],
  },
})
@UseGuards(JwtAuthGuard)
async fundAccount(
  @Request() req,
  @Body()
  body: PaymentRequestDTO
) {
  const userData = req.user; // assuming JWT user includes _id, email, etc.
  return await this.walletService.initiateCheckout(userData, body);
}


 // verify a bank account number
  @Get("verify-fund/:id")
  @ApiOperation({ summary: "Verify a fund paid" })
  async verifyCheckout(
    @Param("id") id: string,
    
  ) {
    return await this.walletService.verifyCheckout(
      id
    );
  }
}
