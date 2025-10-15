import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDTO, LoanRepaymentDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger';
import { LoanCronService } from './loan.cron.service';
import { LoanDoc, LoanModel } from '@app/schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from "moment";
@ApiTags("loan")
@ApiBearerAuth("access-token")

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService,@InjectModel(LoanModel.name)
    private loanModel: Model<LoanDoc>, private readonly loanCronService: LoanCronService) {}

   @Post()
  @ApiOperation({ summary: "Create a new loan" })
  @ApiBody({
    type: LoanDTO,
    description: "Creating a new loan Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() loan: LoanDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   loan.organizationID,
    //   req.loan?._id?.toString(),
    //   Action.Create,
    //   LoanModel,
    // );
    return this.loanService.upset(loan, req.user);
  }

  @Patch(":loanID")
  @ApiOperation({ summary: "Update existing loans" })
  @ApiParam({
    name: "loanID",
    description: "The loanID to search for",
    type: String,
  })
  @ApiBody({
    type: LoanDTO,
    description: "Updating existing loans",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() loan: LoanDTO, @Param("loanID") loanID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   loan.organizationID,
    //   req.loan._id.toString(),
    //   Action.Update,
    //   LoanModel,
    // );
    return this.loanService.update( loanID, loan, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a loan by any key-value pair" })
  @ApiParam({ name: "key", description: "The key to search by", type: String })
  @ApiParam({
    name: "value",
    description: "The value to search for",
    type: String,
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of loans per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.loanService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all loans" })
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of loans per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.loanService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete loans by their IDs" })
  @ApiBody({ type: [String], description: "Array of loan IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.loanService.delete(ids, req.user);
  }

//findByMany
  @Post("by-many")
  @ApiOperation({ summary: "Find loans by multiple criteria" })
  @ApiBody({
    type: LoanDTO,
    description: "Criteria to search for loans",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of loans per page",
    type: Number,
  })
  async findByMany(@Body() data: LoanDTO, @Query() query: any) {
    return this.loanService.findByMany(data, query);
  }
  
 // processLoanRepayment
  @Post("process-repayment/:loanID")
  @ApiOperation({ summary: "Process loan repayment" })
  @ApiParam({
    name: "loanID",
    description: "The loanID to repay",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async processLoanRepayment(@Param("loanID") loanID: string,  @Req() req: any) {
    const loan = await this.loanModel.findById(loanID);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${loanID} not found`);
    }
    const nextPayment = loan.payments.find((p) => p.status === "pending");
    if (!nextPayment) {
      throw new NotFoundException(`No pending payment found for loan with ID ${loanID}`);
    }
    return this.loanCronService.processLoanRepayment(loan._id.toString(), nextPayment, `${loan._id.toString()}-${loan.userID}-${moment().format("YYYYMMDDHHmmss")}` );
  }

  // processLoanRepayment
  @Post("process-repayment/:loanID/all")
  @ApiOperation({ summary: "Process loan repayment" })
  @ApiParam({
    name: "loanID",
    description: "The loanID to repay",
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  async processFullLoanRepayment(@Param("loanID") loanID: string,  @Req() req: any) {
    const loan = await this.loanModel.findById(loanID);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${loanID} not found`);
    }
    const nextPayment = loan.payments.find((p) => p.status === "pending");
    if (!nextPayment) {
      throw new NotFoundException(`No pending payment found for loan with ID ${loanID}`);
    }
    return this.loanCronService.processFullLoanRepayment(loan._id.toString(), nextPayment, `${loan._id.toString()}-${loan.userID}-${moment().format("YYYYMMDDHHmmss")}` );
  }
}

