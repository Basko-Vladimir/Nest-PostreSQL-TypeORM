import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../infrastructure/devices-sessions.repository';
import { DeviceSessionEntity } from '../../entities/db-entities/device-session.entity';

export class CreateDeviceSessionCommand {
  constructor(
    public deviceSessionData: Omit<
      DeviceSessionEntity,
      'id' | 'createdAt' | 'updatedAt' | 'user'
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
