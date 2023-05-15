import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../adapters/email.adapter';
import { IEmailInfoModel } from '../types';
import { IUser } from '../../users/entities/interfaces';

@Injectable()
export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  formRegistrationEmail(user: Partial<IUser>): void {
    const messageInfo: IEmailInfoModel = {
      from: 'Test Backend Server <dev.test.vladimir@gmail.com>',
      to: user.email,
      subject: 'Test Backend Server Registration',
      html: `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${user.confirmationCode}>
         	Complete registration
        </a>
      </p>`,
    };

    return this.emailAdapter.sendEmail(messageInfo);
  }

  async formRecoverPasswordEmail(
    email: string,
    recoveryCode: string,
  ): Promise<void> {
    const messageInfo: IEmailInfoModel = {
      from: 'Test Backend Server <dev.test.vladimir@gmail.com>',
      to: email,
      subject: 'Test Backend Server Registration',
      html: `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href=https://somesite.com/password-recovery?recoveryCode=${recoveryCode}>Recovery password</a>
      </p>`,
    };

    return this.emailAdapter.sendEmail(messageInfo);
  }
}
