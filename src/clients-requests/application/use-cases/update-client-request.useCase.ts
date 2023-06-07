import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientsRequestsRepository } from '../../infrastructure/clients-requests.repository';
import { ClientRequestEntity } from '../../entities/db-entities/client-request.entity';

export class UpdateClientRequestCommand {
  constructor(public clientRequest: ClientRequestEntity) {}
}

@CommandHandler(UpdateClientRequestCommand)
export class UpdateClientRequestUseCase
  implements ICommandHandler<UpdateClientRequestCommand>
{
  constructor(private clientsRequestsRepository: ClientsRequestsRepository) {}

  async execute(command: UpdateClientRequestCommand): Promise<void> {
    const { clientRequest } = command;
    const newCreateTimeStamp = Date.now();

    await this.clientsRequestsRepository.updateClientRequest(
      clientRequest.id,
      newCreateTimeStamp,
    );
  }
}
