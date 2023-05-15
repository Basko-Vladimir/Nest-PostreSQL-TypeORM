import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesSessionsRepository } from '../../../devices-sessions/infrastructure/devices-sessions.repository';

export class LogoutCommand {
  constructor(public deviceSessionId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  execute(command: LogoutCommand): Promise<void> {
    return this.devicesSessionsRepository.deleteDeviceSessionById(
      command.deviceSessionId,
    );
  }
}
