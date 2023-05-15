import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../infrastructure/devices-sessions.repository';

export class DeleteAllDevicesSessionsExceptCurrentCommand {
  constructor(public deviceSessionId: string) {}
}

@CommandHandler(DeleteAllDevicesSessionsExceptCurrentCommand)
export class DeleteAllDevicesSessionsExceptCurrentUseCase
  implements ICommandHandler<DeleteAllDevicesSessionsExceptCurrentCommand>
{
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  async execute(
    command: DeleteAllDevicesSessionsExceptCurrentCommand,
  ): Promise<void> {
    return this.devicesSessionsRepository.deleteAllDevicesSessionsExceptCurrent(
      command.deviceSessionId,
    );
  }
}
