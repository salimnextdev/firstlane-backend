
import { ApiProperty } from '@nestjs/swagger';

export class DisputeDTO {
  @ApiProperty({ description: 'Unique identifier for the dispute', required: false })
  _id?: string;

  @ApiProperty({ description: 'Ride ID associated with the dispute' })
  rideID: string;

  adminID:string;
  
  @ApiProperty({ description: 'is read', default:false })
  isRead:boolean
  
  @ApiProperty({ description: 'Description of the dispute' })
  description: string;
  @ApiProperty({ description: 'Last message sent', required: false })
  lastMessage: string;

  @ApiProperty({ description: 'Last message sent by', required: false })
  lastMessageBy: string;
  
  //admin
  @ApiProperty({ description: 'User ID who sending the dispute', required: false })

  userID?: string;
  
  @ApiProperty({ description: 'Dispute ID', required: false })
  disputeID:string

  @ApiProperty({ description: 'Reason for the dispute' })
  reason: string;

  @ApiProperty({ description: 'Type of dispute' })
  type: string;

  @ApiProperty({ description: 'Status of the dispute', enum: ['pending', 'resolved'], default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Resolution of the dispute', required: false })
  resolution?: string;
}
