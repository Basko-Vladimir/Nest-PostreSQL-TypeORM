import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UpdateOrFilterModel } from '../../common/types';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  // async getNotBannedUsersFilter(): Promise<UpdateOrFilterModel[]> {
  //   const notBannedUsers = await this.usersRepository.findManyUserByFilter({
  //     ['banInfo.isBanned']: false,
  //   });
  //
  //   return notBannedUsers.map((user) => ({ userId: String(user.id) }));
  // }
}
