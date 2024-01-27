import { SendEmailTypes } from '../../dto/sendEmail.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDtoSwagger {
  @ApiProperty({ type: 'number', required: true, example: 33 })
  userId: number;

  @ApiProperty({
    description: 'Type of email message',
    required: true,
    example: SendEmailTypes.REGISTER_CONFIRM,
    enum: SendEmailTypes,
  })
  emailType: SendEmailTypes;
}
