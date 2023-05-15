import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientsRequestsRepository } from '../../infrastructure/clients-requests.repository';
import { IClientRequest } from '../../entities/interfaces';

export class UpdateClientRequestCommand {
  constructor(public clientRequest: IClientRequest) {}
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
