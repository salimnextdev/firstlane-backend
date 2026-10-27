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
  InternalServerErrorException,
  Inject,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SettingsDoc, SettingsModel } from "@app/schema";
import { Model } from "mongoose";

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
  PickType,
} from "@nestjs/swagger";
import { readFileSync } from "fs";
import * as path from "path";
import * as fs from "fs";
@Controller("")
@ApiBearerAuth("access-token")
export class AppController {
  constructor(
    @InjectModel(SettingsModel.name) private settingsModel: Model<SettingsDoc>,
  ) { }
  private readonly logger = new Logger(AppController.name);
  private readonly dataPath = path.resolve(process.cwd(), "nigeria.json");

  @Get("statesV2")
  @ApiOperation({ summary: "Get all states" })
  @ApiQuery({ name: "stateName", required: false, type: String })

  async getLgaState(@Query("stateName") stateName?: string
  ): Promise<any> {

    let data = JSON.parse(
      readFileSync("allnigeria_polling_units_with_coords.json", "utf-8")
    );
    let state
    if (stateName) {
      state = data.find((state: any) => state.name.toLowerCase() === stateName.toLowerCase()).lgas.map((lga: any) => lga.name);
      if (!state) return [];

    } else {
      state = data.map((state: any) => state.name)
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


  @Get('states')
  @ApiQuery({ name: 'stateName', required: false })
  @ApiQuery({ name: 'lga', required: false })
  getStates(@Query() query: any) {
    return {
      data: this.getStatesV2(query),
      message: "Success",
    };
  }

  private loadData() {
    try {
      // const data = fs.readFileSync(this.dataPath, "utf8");
      let data = JSON.parse(
        readFileSync("nigeria.json", "utf-8")
      );
      return (data);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException("Could not load state data");
    }
  }

  getStatesV2(query: any) {
    const data = this.loadData();
    const { stateName, lga } = query;
    let found;
    if (stateName) {
      found =
        data.find((s) => s.state.toLowerCase() === stateName.toLowerCase())
          ?.lgas ?? [];
    } else if (lga) {
      found = data.flatMap((s) => s.lgas).sort();
    } else {
      found = data.map((s) => s.state).sort();
    }
    return found;
  }
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  async getSettings() {
    const settings = await this.settingsModel.findOne({});
    return {
      message: "Settings retrieved successfully",
      status: true,
      data: settings,
    };
  }

}
