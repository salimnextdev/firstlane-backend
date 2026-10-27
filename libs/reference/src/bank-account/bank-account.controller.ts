import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("bankAccount")
@ApiBearerAuth("access-token")

@Controller('bankAccount')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

   @Post()
  @ApiOperation({ summary: "Create a new bankAccount" })
  @ApiBody({
    type: BankAccountDTO,
    description: "Creating a new bankAccount Details",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() bankAccount: BankAccountDTO, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   bankAccount.organizationID,
    //   req.bankAccount?._id?.toString(),
    //   Action.Create,
    //   BankAccountModel,
    // );
    return this.bankAccountService.upset(bankAccount, req.user);
  }

  @Patch(":bankAccountID")
  @ApiOperation({ summary: "Update existing bankAccounts" })
  @ApiParam({
    name: "bankAccountID",
    description: "The bankAccountID to search for",
    type: String,
  })
  @ApiBody({
    type: BankAccountDTO,
    description: "Updating existing bankAccounts",
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() bankAccount: BankAccountDTO, @Param("bankAccountID") bankAccountID: string, @Req() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   bankAccount.organizationID,
    //   req.bankAccount._id.toString(),
    //   Action.Update,
    //   BankAccountModel,
    // );
    return this.bankAccountService.update( bankAccountID, bankAccount, req.user);
  }

  @Get("by-any/:key/:value")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Find a bankAccount by any key-value pair" })
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
    description: "Number of bankAccounts per page",
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any
  ) {
    return this.bankAccountService.findByAny(params, query);
  }

  @Get("")
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all bankAccounts" })
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
    description: "Number of bankAccounts per page",
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.bankAccountService.findAll(query);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: "Delete bankAccounts by their IDs" })
  @ApiBody({ type: [String], description: "Array of bankAccount IDs to delete" })
  async delete(@Body() ids: string[],  @Req() req: any) {
    return this.bankAccountService.delete(ids, req.user);
  }
  
}
