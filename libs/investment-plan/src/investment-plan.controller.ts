import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@app/guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { InvestmentPlanDTO } from '@app/dto';
import { InvestmentPlanService } from './investment-plan.service';


 class UpdateInvestmentPlanDTO extends PartialType(InvestmentPlanDTO) {
  @ApiProperty({ type: String })
  _id: string;
}

@ApiTags('investmentPlans')
@ApiBearerAuth('access-token')
@Controller('investmentPlans')
export class InvestmentPlanController {
  constructor(
    private investmentPlanService: InvestmentPlanService,
    // private organizationAbilityFactory: OrganizationAbilityFactory,
     
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investmentPlan' })
  @ApiBody({
    type: InvestmentPlanDTO,
    description: 'Creating a new investmentPlan Details',
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() investmentPlan: InvestmentPlanDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   investmentPlan.organizationID,
    //   req.investmentPlan?._id?.toString(),
    //   Action.Create,
    //   InvestmentPlanModel,
    // );
    return this.investmentPlanService.upset(investmentPlan, req.user);
  }



  @Patch()
  @ApiOperation({ summary: 'Update existing investmentPlans' })
  @ApiBody({
    type:  UpdateInvestmentPlanDTO,
    description: 'Updating existing investmentPlans',
  })
  @UseGuards(JwtAuthGuard)
  async update(@Body() investmentPlan: InvestmentPlanDTO, @Request() req: any) {
    // await this.organizationAbilityFactory.checkAbility(
    //   investmentPlan.organizationID,
    //   req.investmentPlan._id.toString(),
    //   Action.Update,
    //   InvestmentPlanModel,
    // );
    return this.investmentPlanService.update(investmentPlan, req.user);
  }

  @Get('by-any/:key/:value')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find a investmentPlan by any key-value pair' })
  @ApiParam({ name: 'key', description: 'The key to search by', type: String })
  @ApiParam({
    name: 'value',
    description: 'The value to search for',
    type: String,
  })
    @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of investmentPlans per page',
    type: Number,
  })
  async findbyId(
    @Param() params: { key: string; value: string },
    @Query() query: any,

  ) {
    return this.investmentPlanService.findByAny(params, query);
  }

  @Get('')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all investmentPlans' })
  @UseGuards(JwtAuthGuard)
    @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of investmentPlans per page',
    type: Number,
  })
  async findAll(@Query() query: any) {
    return this.investmentPlanService.findAll(query);
  }

  @Delete('')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete investmentPlans by their IDs' })
  @ApiBody({ type: [String], description: 'Array of investmentPlan IDs to delete' })
  async delete(@Body() ids: string[], @Request() req: any) {
    return this.investmentPlanService.delete(ids, req.user);
  }

 

    
}
