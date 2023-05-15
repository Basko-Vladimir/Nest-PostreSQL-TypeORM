import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../infrastructure/devices-sessions.repository';
import { IDeviceSession } from '../../entities/interfaces';

export class CreateDeviceSessionCommand {
  constructor(
    public deviceSessionData: Omit<
      IDeviceSession,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ) {}
}

@CommandHandler(CreateDeviceSessionCommand)
export class CreateDeviceSessionUseCase
  implements ICommandHandler<CreateDeviceSessionCommand>
{
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  async execute(command: CreateDeviceSessionCommand): Promise<void> {
    await this.devicesSessionsRepository.createDeviceSession(
      command.deviceSessionData,
    );
  }
}
