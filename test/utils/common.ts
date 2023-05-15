import request from 'supertest';
import { useContainer } from 'class-validator';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { exceptionFactory } from '../../src/common/factories/exception.factory';
import { ServerErrorsFilter } from '../../src/common/filters/server-errors.filter';
import { HttpExceptionsFilter } from '../../src/common/filters/http-exceptions.filter';

type InitTestAppReturnType = {
  nestApp: INestApplication;
  mongoMemoryServer: string;
};

export const initTestApp = async (): Promise<InitTestAppReturnType> => {
  let mongoMemoryServer;
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRootAsync({
        useFactory: async () => {
          mongoMemoryServer = await MongoMemoryServer.create();
          const uri = mongoMemoryServer.getUri();
          return { uri };
        },
      }),
      AppModule,
    ],
  }).compile();

  const nestApp: INestApplication = moduleRef.createNestApplication();
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory,
    }),
  );
  nestApp.useGlobalFilters(
    new ServerErrorsFilter(),
    new HttpExceptionsFilter(),
  );
  useContainer(nestApp.select(AppModule), { fallbackOnErrors: true });

  await nestApp.init();
  await clearDataBase(nestApp);

  return { nestApp, mongoMemoryServer };
};

//Clear all Data Base
export const clearDataBase = (app: INestApplication) =>
  request(app.getHttpServer()).delete('/testing/all-data');
