import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../adapters/email.adapter';
import { IEmailInfoModel } from '../types';

@Injectable()
export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  formRegistrationEmail(email: string, confirmationCode: string): void {
    const messageInfo: IEmailInfoModel = {
      from: 'Test Backend Server <dev.test.vladimir@gmail.com>',
      to: email,
      subject: 'Test Backend Server Registration',
      html: `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${confirmationCode}>
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
