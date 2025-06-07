import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CountryDoc = HydratedDocument<CountryModel>;

@Schema({ timestamps: true })
export class CountryModel {
  
     @Prop({  })
    id:string
  @Prop({  })
  name: string;

  @Prop({  uppercase: true,  })
  code: string;

  @Prop({  })
  flag: string; // URL to svg/png

  @Prop({  uppercase: true,  })
  currency: string; // ISO‑4217 code, e.g. "NGN"

  @Prop({  })
  currency_symbol: string; // e.g. "₦"

  @Prop({  })
  capital: string;

  @Prop({  })
  continent: string; // e.g. "Africa"

  @Prop({  uppercase: true, minlength: 2, maxlength: 2 })
  continent_code: string; // e.g. "AF"

  @Prop({  })
  dialCode: string; // e.g. "+234"


  @Prop({  type: Number, min: -90, max: 90 })
  latitude?: number;

  @Prop({  type: Number, min: -180, max: 180 })
  longitude?: number;
}

export const CountrySchema = SchemaFactory.createForClass(CountryModel);
