import {
  RideStatus,
  PaymentStatus,
  RideType,
} from '@app/enum/shared/ride.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';

export type RideDoc = HydratedDocument<RideModel>;
export const rideStatusObject = Object.values(RideStatus).reduce((acc, status) => {
  acc[status] = null
  return acc;
}, {} as Record<string, Date >);


class RideStatusDate {
  @Prop({ type: Date, default: new Date() })
  pending?: Date;
  @Prop({ type: Date  })
  accepted?: Date;
  @Prop({ type: Date })
  in_progress?: Date;
  @Prop({ type: Date })
  completed?: Date;
  @Prop({ type: Date })
  delivered?: Date;
  @Prop({ type: Date })
  canceled?: Date;
}



class Location {
  @Prop()
  address: string;

  @Prop()
  long: string;

  @Prop()
  lag: string;
}
class OrderItem {
  @Prop()
  item: string;

  @Prop()
  unit: number;

  @Prop()
  pricePerUnit: number;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ type: OrderItem, default: {} })
  pickupLocation: Location;

  @Prop({ type: OrderItem, default: {} })
  dropoffLocation: Location;

  @Prop()
  receiverName: string;

  @Prop()
  receiverPhone: string;
}

class Bids {
  @Prop({ type: String, ref: 'UserModel' })
  riderId: string;
  @Prop()
  price: number;
  @Prop()
  reason: string;
}


class Rating {
  @Prop()
  rating: number;
  @Prop()
  feedback: string;
  @Prop()
  userID: string;
  @Prop({default:new Date()})
  date: Date;
  

}

class RidesStatus {
  @Prop({ type: String, enum: RideStatus, default: RideStatus.PENDING })
  status: RideStatus;

  //date
  @Prop({ type: Date })
  date: Date;
}

@Schema({ timestamps: true })
export class RideModel {
  @Prop({ required: false, unique: true })
  id?: string;
  @Prop({ ref: 'UserModel' })
  userID: string;
  @Prop({ ref: 'UserModel' })
  riderID: string;
  @Prop()
  state: string;

  @Prop({ default: 0 })
  bidPrice: number;

  @Prop({ enum: RideType, default: RideType.RIDE })
  rideType: string;

  @Prop({})
  driverID: string;

  @Prop({ type: OrderItem, default: {} })
  pickupLocation: Location;

  @Prop({ type: OrderItem, default: {} })
  dropoffLocation: Location;

  @Prop({ type: RideStatusDate, default:{pending: new Date()}  })
  statusDate: RideStatusDate;

  @Prop({
    type: RidesStatus, default: {
      status: RideStatus.PENDING,
      date: new Date(),
    }
   
  })
  status: RidesStatus;

  @Prop({})
  startTime: string;

  @Prop({ type: [Bids], default: [] })
  bids: Bids[];

  @Prop()
  endTime?: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
  })
  type: string;

   @Prop({
    type: [Number], // [longitude, latitude]
    index: '2dsphere',
  })
  coordinates: number[];
  @Prop({})
  fare: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop()
  distanceCovered?: number;

  @Prop()
  timeTaken?: number;

  @Prop({default:false})
isPaid?: boolean;
  @Prop()
transferCode?: string;
 @Prop()
reference?: string;
  @Prop()
  driverFeedback?: string;
  @Prop()
  image?: string;
  @Prop()
  description?: string;

  @Prop()
  passengerFeedback?: string;

  @Prop({ type: [OrderItem], default: [] })
  orders?: OrderItem[];
  @Prop({default:0})
  recommededPrice?:number;
  
  @Prop({ type: Rating,  })
  rating?: Rating;
}

export const RideSchema = SchemaFactory.createForClass(RideModel);

// **Hash Password Before Saving**
RideSchema.pre<RideModel>('save', async function (next) {
  this.id = randomInt(99999) + randomUUID().replace(/\D/g, '').substring(0, 5);
  this.coordinates=[Number(this.pickupLocation.long),Number(this.pickupLocation.lag)]
  next();
});
