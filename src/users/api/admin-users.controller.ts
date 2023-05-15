import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersQueryParamsDto } from './dto/users-query-params.dto';
import {
  AllUsersOutputModel,
  IUserOutputModel,
} from './dto/users-output-models.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user.useCase';
import { DeleteUserCommand } from '../application/use-cases/delete-user.useCase';
import { QueryAdminUsersRepository } from '../infrastructure/query-admin-users-repository.service';
import { UpdateUserBanStatusDto } from './dto/update-user-ban-status.dto';
import { UpdateUserBanStatusCommand } from '../application/use-cases/update-user-ban-status.useCase';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';

@Controller('sa/users')
export class AdminUsersController {
  constructor(
    private queryUsersRepository: QueryAdminUsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async findAllUsers(
    @Query() query: UsersQueryParamsDto,
  ): Promise<AllUsersOutputModel> {
    return this.queryUsersRepository.findAllUsers(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.USER_ID])
  @UseGuards(BasicAuthGuard, CheckExistingEntityGuard)
  async deleteUser(
    @Param('id')
    userId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(userId));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<IUserOutputModel> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.USER_ID])
  @UseGuards(BasicAuthGuard, CheckExistingEntityGuard)
  async updateUserBanStatus(
    @Param('id')
    userId: string,
    @Body() updateUserBanStatusDto: UpdateUserBanStatusDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateUserBanStatusCommand(userId, updateUserBanStatusDto),
    );
  }
}
