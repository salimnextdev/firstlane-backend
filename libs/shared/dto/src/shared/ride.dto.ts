import { PaymentStatus, RideStatus, RideType } from '@app/enum/shared/ride.enum';
import { ApiProperty } from '@nestjs/swagger';
class Location {
  @ApiProperty({ description: 'Address of the location', example: '123 Main St' })
  address: string;

  @ApiProperty({ description: 'Longitude of the location', example: '-122.4194' })
  long: string;

  @ApiProperty({ description: 'Latitude of the location', example: '37.7749' })
  lag: string;
}
class RidesStatus {
  @ApiProperty({
    description: 'Status of the ride',
    enum: RideStatus,
    example: 'pending',
    default: RideStatus.PENDING,
  })
  status: RideStatus;

  @ApiProperty({ description: 'Date of the status update', example: '2025-03-22T08:30:00Z' })
  date: Date;
}

export class RatingDTO {
  @ApiProperty({ description: 'Rating given by the user for the ride', example: '4.5' })
  rating: number;

  @ApiProperty({ description: 'Feedback given by the user for the ride', example: 'Great ride!' })
  feedback: string;
  @ApiProperty({ description: 'User _id of the user who gave the rating', example: '1234567890' })
  userID: string;

  @ApiProperty({ description: 'Date of the rating', example: '2025-03-22T08:30:00Z' })
 date:Date 

}
class OrderItem {
  @ApiProperty({ description: 'Name of the item', example: 'Water Bottle' })
  item: string;
  @ApiProperty({ description: 'The distance covered during the ride in kilometers', example: '12.5' })
  distanceCovered?: number;

  @ApiProperty({ description: 'Total time taken for the ride in minutes', example: '30' })
  timeTaken?: number;
  @ApiProperty({ description: 'Number of units ordered', example: 2 })
  unit: number;

  @ApiProperty({ description: 'Price per unit', example: 1.5 })
  pricePerUnit: number;

  @ApiProperty({ description: 'Description of the item', example: '500ml mineral water bottle' })
  description: string;

  @ApiProperty({ description: 'Image of the item', example: 'https://example.com/water.jpg' })
  image: string;

  @ApiProperty({ type: Location, description: 'Pickup location for the item', example: { address: '123 Main St', long: '-122.4194', lag: '37.7749' } })
  pickupLocation: Location;

  @ApiProperty({ type: Location, description: 'Drop-off location for the item', example: { address: '456 Oak Ave', long: '-122.4294', lag: '37.7849' } })
  dropoffLocation: Location;

  //receiver name and phone 
  @ApiProperty({ description: 'Name of the receiver', example: 'John Doe' })
  receiverName: string;

  @ApiProperty({ description: 'Phone number of the receiver', example: '+1234567890' })
  receiverPhone: string;
  
  @ApiProperty({description:"recommended price for the ride"})
  recommededPrice?:number;

}


class Bids {
  @ApiProperty({ description: 'User _id of the rider' })
  riderId: string;
  @ApiProperty({ description: 'Price of the bid' })
  price: number;
  @ApiProperty({ description: 'Reason for the bid' })
  reason: string;
}



export class RideDTO {
  @ApiProperty({ description: 'Unique identifier for the ride', required: false })
  _id?: string;

  @ApiProperty({ description: 'User _id of the passenger' })
  userID: string;
  @ApiProperty({ description: 'User _id of the rider' })
  riderID: string;

  @ApiProperty({ example: 'California' })
  state?: string;
  @ApiProperty({type:[Bids],description:"List of bids",})
  bids:Bids[]
  @ApiProperty({ description: 'Image of the ride', required: false })
  image?: string;

  @ApiProperty({ description: 'Description of the ride', required: false })
  description?: string;
  

  @ApiProperty({ description: 'Driver _id of the rider' })
  driverID: string;

  @ApiProperty({ description: 'Bid price for the ride' })
  bidPrice: number;
  

  @ApiProperty({ description: 'Pickup location address' })
  pickupLocation: Location;

  @ApiProperty({ description: 'Drop-off location address' })
  dropoffLocation: Location;

  @ApiProperty({
    type: RidesStatus,
    description: 'Status of the ride',
    default: { status: RideStatus.PENDING, date: new Date() },
  })
  status: RidesStatus;
  

  @ApiProperty({ description: 'Ride start time in ISO format', example: '2025-03-22T08:30:00Z' })
  startTime: string;

  @ApiProperty({ description: 'Ride end time in ISO format', example: '2025-03-22T09:00:00Z' })
  endTime?: string;

  @ApiProperty({ description: 'Total fare for the ride', example: '15.50' })
  fare: number;

  @ApiProperty({ description: 'Payment status', enum:PaymentStatus, example: 'paid', default: 'unpaid' })
  paymentStatus: string;

  @ApiProperty({ description: 'The distance covered during the ride in kilometers', example: '12.5' })
  distanceCovered?: number;

  @ApiProperty({ description: 'Total time taken for the ride in minutes', example: '30' })
  timeTaken?: number;

  // @ApiProperty({ description: 'Rating given by the user for the ride', example: '4.5' })
  // rating?: number;

  @ApiProperty({ description: 'Driver feedback on the ride', required: false })
  driverFeedback?: string;

  @ApiProperty({ description: 'Passenger feedback on the ride', required: false })
  passengerFeedback?: string;

  @ApiProperty({ enum:RideType, description: 'Type of ride', example: 'pickup', default: RideType.PICKUP, required: false })
  rideType?: string;

  @ApiProperty({ description: 'List of orders placed during the ride', type: [OrderItem], required: false })
  orders?: OrderItem[];

  // rating
  @ApiProperty({ description: 'Rating given by the user for the ride', required: false })
  rating?: RatingDTO;

}




