import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../infrastructure/devices-sessions.repository';

export class DeleteDeviceSessionCommand {
  constructor(public deviceSessionId: string) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionUseCase
  implements ICommandHandler<DeleteDeviceSessionCommand>
{
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  async execute(command: DeleteDeviceSessionCommand): Promise<any> {
    return this.devicesSessionsRepository.deleteDeviceSessionById(
      command.deviceSessionId,
    );
  }
}
