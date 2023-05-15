import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ClientsRequestsRepository } from '../../clients-requests/infrastructure/clients-requests.repository';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { CreateClientRequestCommnad } from '../../clients-requests/application/use-cases/create-client-request.useCase';
import { UpdateClientRequestCommand } from '../../clients-requests/application/use-cases/update-client-request.useCase';
import { UpdateManyClientsRequestsCommand } from '../../clients-requests/application/use-cases/update-many-clients-requests.useCase';

@Injectable()
export class ClientsRequestsGuard implements CanActivate {
  TIME_LIMIT = 10000;
  COUNT_LIMIT = 5;

  constructor(
    private clientsRequestsRepository: ClientsRequestsRepository,
    private commandBus: CommandBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const endpoint = req.originalUrl;
    const ip = req.ip;
    const currentMoment = Date.now();
    const clientRequests =
      await this.clientsRequestsRepository.getClientRequestsByFilter(
        ip,
        endpoint,
      );

    if (clientRequests.length >= this.COUNT_LIMIT) {
      const timeBetweenLastFirstRequests =
        currentMoment - clientRequests[0].createTimeStamp;

      if (timeBetweenLastFirstRequests <= this.TIME_LIMIT) {
        await this.commandBus.execute(
          new UpdateManyClientsRequestsCommand(ip, endpoint, currentMoment),
        );

        throw new TooManyRequestsException();
      } else {
        await this.commandBus.execute(
          new UpdateClientRequestCommand(clientRequests[0]),
        );
      }
    } else {
      await this.commandBus.execute(
        new CreateClientRequestCommnad(endpoint, ip),
      );
    }

    return true;
  }
}
