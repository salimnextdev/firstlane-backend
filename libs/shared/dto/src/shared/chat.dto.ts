import { ApiProperty } from '@nestjs/swagger';

export class ChatDTO {
  @ApiProperty({ description: 'Unique identifier for the chat message', required: false })
  _id?: string;

  @ApiProperty({ description: 'Sender user ID (either passenger or driver)' })
  senderID: string;

  @ApiProperty({ description: 'Ride ID' })
  rideID: string;

  @ApiProperty({ description:'receiver ID' })
  receiverID: string;

  @ApiProperty({ description: 'Chat message content' })
  message: string;

  @ApiProperty({ description: 'Message type', example: 'text', enum: ['text', 'image', 'video', 'audio'] })
  messageType: string;

  @ApiProperty({ description: 'Status of the message', example: 'sent', enum: ['sent', 'delivered', 'read'], default: 'sent' })
  status: string;

  @ApiProperty({ description: 'Indicates whether the message is a system notification', default: false })
  isSystemMessage: boolean;

  @ApiProperty({ description: 'Optional URL for media files (e.g., image, video)', required: false })
  mediaUrl?: string;
}
