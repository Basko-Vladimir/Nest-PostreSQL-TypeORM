import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientsRequestsRepository } from '../../infrastructure/clients-requests.repository';

export class CreateClientRequestCommnad {
  constructor(public endpoint: string, public ip: string) {}
}

@CommandHandler(CreateClientRequestCommnad)
export class CreateClientRequestUseCase
  implements ICommandHandler<CreateClientRequestCommnad>
{
  constructor(private clientsRequestsRepository: ClientsRequestsRepository) {}

  async execute(command: CreateClientRequestCommnad): Promise<string> {
    const { ip, endpoint } = command;
    const createTimeStamp = Date.now();
    const createdClientRequest =
      await this.clientsRequestsRepository.createClientRequest(
        ip,
        endpoint,
        createTimeStamp,
      );

    return createdClientRequest.id;
  }
}
