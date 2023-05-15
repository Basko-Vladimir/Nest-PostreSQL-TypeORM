import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../infrastructure/devices-sessions.repository';

export class UpdateDeviceSessionCommand {
  constructor(public sessionId: string, public issuedAt: number) {}
}

@CommandHandler(UpdateDeviceSessionCommand)
export class UpdateDeviceSessionUseCase
  implements ICommandHandler<UpdateDeviceSessionCommand>
{
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  async execute(command: UpdateDeviceSessionCommand): Promise<void> {
    const { sessionId, issuedAt } = command;

    await this.devicesSessionsRepository.updateDeviceSessionIssuedAt(
      sessionId,
      issuedAt,
    );
  }
}
