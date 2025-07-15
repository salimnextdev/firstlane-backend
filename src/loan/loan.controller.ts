import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDTO } from '@app/dto';
import { JwtAuthGuard } from '@app/guard';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("loan")
@ApiBearerAuth("access-token")

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

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
  
}
