import { serviceResponse } from "@app/service";
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Req,
  UseGuards,
  NotFoundException,
  Query,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
  PickType,
} from "@nestjs/swagger";
import { readFileSync } from "fs";

@Controller("")
@ApiBearerAuth("access-token")
export class AppController {
  constructor() {}
  private readonly logger = new Logger(AppController.name);

  @Get("states")
  @ApiOperation({ summary: "Get all states" })
  @ApiQuery({ name: "stateName", required: false, type: String })
 
  async getLgaState(@Query("stateName") stateName?: string
  ): Promise<any> {
   
    let data = JSON.parse(
      readFileSync("allnigeria_polling_units_with_coords.json", "utf-8")
    );
let state
     if (stateName ) {
       state = data.find((state:any) => state.name.toLowerCase() === stateName.toLowerCase()).lgas.map((lga:any) => lga.name);
  if (!state) return [];
  
    }else{
       state = data.map((state:any) => state.name)
    }
    
   
    try {
      return serviceResponse({
        message: "Success",
        data: state,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
