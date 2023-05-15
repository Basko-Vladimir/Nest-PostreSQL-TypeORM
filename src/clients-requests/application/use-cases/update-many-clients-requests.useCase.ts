import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientsRequestsRepository } from '../../infrastructure/clients-requests.repository';

export class UpdateManyClientsRequestsCommand {
  constructor(
    public ip: string,
    public endpoint: string,
    public createTimeStamp: number,
  ) {}
}

@CommandHandler(UpdateManyClientsRequestsCommand)
export class UpdateManyClientsRequestsUseCase
  implements ICommandHandler<UpdateManyClientsRequestsCommand>
{
  constructor(private clientsRequestsRepository: ClientsRequestsRepository) {}

  execute(command: UpdateManyClientsRequestsCommand): Promise<void> {
    const { ip, endpoint, createTimeStamp } = command;

    return this.clientsRequestsRepository.updateManyClientsRequestsByFilter(
      ip,
      endpoint,
      createTimeStamp,
    );
  }
}
