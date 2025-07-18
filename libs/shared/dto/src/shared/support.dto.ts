import { ApiProperty } from "@nestjs/swagger";

export class SupportDTO {
  @ApiProperty({
    description: "Unique identifier for the support ticket",
    required: false,
  })
  _id?: string;

  @ApiProperty({ description: "User ID who created the ticket" })
  userID: string;

  @ApiProperty({ description: "admin ID who attend the ticket" })
  adminID: string;

  @ApiProperty({ description: "Subject of the support ticket" })
  subject: string;
  @ApiProperty({ description: "_ID of the support ticket" })
  supportID: string;

  @ApiProperty({ description: "Description of the issue" })
  description: string;

  @ApiProperty({
    description: "Status of the ticket",
    enum: ["open", "closed", "pending"],
    default: "open",
  })
  status: string;

  @ApiProperty({
    description: "Priority of the ticket",
    enum: ["low", "medium", "high"],
    default: "low",
  })
  priority: string;

  @ApiProperty({
    description: "Message of the ticket",
    type: String,
    example: "hello",
  })
  message?: string;
  @ApiProperty({
    description: "Attachment URL for the ticket",
    required: false,
  })
  url: string;
}
