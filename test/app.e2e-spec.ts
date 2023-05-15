import request from 'supertest';
import { disconnect } from 'mongoose';
import { initTestApp } from './utils/common';

describe('AppController (e2e)', () => {
  jest.setTimeout(20 * 1000);
  let app, mongoMS;

  beforeAll(async () => {
    const { nestApp, mongoMemoryServer } = await initTestApp();
    app = nestApp;
    mongoMS = mongoMemoryServer;
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
    await mongoMS.stop();
    await disconnect();
  });
});
