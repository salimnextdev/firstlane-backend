
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StateDoc = HydratedDocument<StateModel>;

@Schema({ timestamps: true })
export class StateModel {
  
     @Prop({  })
    id:string
  @Prop({  })
  name: string;

  @Prop({  })
  countryId: string;
  @Prop({  })
  country: string;
    @Prop({  })
  capital: string;
  @Prop({  })
  code: string;
  @Prop({  })
  latitude: number;
  @Prop({  })
  longitude: number;
 
  

}

export const StateSchema = SchemaFactory.createForClass(StateModel);
