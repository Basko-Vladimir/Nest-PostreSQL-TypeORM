import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const authRequests = {
  registrationRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).post('/auth/registration');
  },
  registrationConfirmationRequest: (app: INestApplication) => {
    request(app.getHttpServer()).post('/auth/registration-confirmation');
  },
  loginRequest: (app: INestApplication) => {
    return request(app.getHttpServer()).post('/auth/login');
  },
};
