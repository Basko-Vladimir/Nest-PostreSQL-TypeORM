import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { User } from '../entities/db-entities/user.entity';
import { DbEmailConfirmation } from '../entities/db-entities/email-confirmation.entity';

const selectingUsersFields = [
  'user',
  'emailConfirmation.confirmationCode',
  'emailConfirmation.isConfirmed',
  'emailConfirmation.expirationDate',
];

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private typeOrmUsersRepository: Repository<User>,
    @InjectRepository(DbEmailConfirmation)
    private typeOrmEmailConfirmationRepository: Repository<DbEmailConfirmation>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findUserById(userId: string = null): Promise<User | null> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findUserByLoginOrEmail(
    userFilter: Partial<Pick<User, 'email' | 'login'>>,
  ): Promise<User | null> {
    const { email, login } = userFilter;

    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('user.email = :email', { email })
      .orWhere('user.login = :login', { login })
      .getOne();
  }

  async findUserByConfirmationCode(code: string): Promise<User | null> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('emailConfirmation.confirmationCode = :code', { code })
      .getOne();
  }

  async findUserByPasswordRecoveryCode(code: string): Promise<User | null> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('user.passwordRecoveryCode = :code', { code })
      .getOne();
  }

  async createUser(
    createUserDto: CreateUserDto,
    passwordHash: string,
    isConfirmed: boolean,
  ): Promise<User> {
    const { login, email } = createUserDto;
    const createdUser = await this.typeOrmUsersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ login, email, passwordHash })
      .returning(['login', 'id', 'email', 'passwordHash'])
      .execute();

    await this.typeOrmEmailConfirmationRepository
      .createQueryBuilder()
      .insert()
      .into(DbEmailConfirmation)
      .values({
        userId: createdUser.identifiers[0].id,
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      })
      .execute();

    return this.findUserById(createdUser.identifiers[0].id);
  }

  async updateUserBanStatus(
    userId: string,
    isBanned: boolean,
    reason: string,
  ): Promise<void> {
    const banReason = isBanned ? reason : null;

    await this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .update(User)
      .set({ isBanned, banReason, banDate: isBanned ? new Date() : null })
      .where('id = :userId', { userId })
      .execute();
  }

  async confirmUserRegistration(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE "emailConfirmation"
        SET "isConfirmed" = true
        WHERE "userId" = $1
      `,
      [userId],
    );
  }

  async updateConfirmationCode(userId: string, code: string): Promise<void> {
    const expirationDate = add(new Date(), { hours: 1 });

    await this.dataSource.query(
      `UPDATE "emailConfirmation"
        SET "confirmationCode" = $1,
            "expirationDate" = $2
        WHERE "userId" = $3
      `,
      [code, expirationDate, userId],
    );
  }

  async updatePasswordRecoveryCode(
    userId: string,
    newCode: string,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "user"
        SET "passwordRecoveryCode" = '${newCode}'
        WHERE "id" = $1
      `,
      [userId],
    );
  }

  async updatePassword(
    userId: string,
    hash: string,
    recoveryCode,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "user"
        SET "passwordHash" = $1, "passwordRecoveryCode" = $2
        WHERE "id" = $3
      `,
      [hash, recoveryCode, userId],
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .delete()
      .from(User)
      .where('id = :userId', { userId })
      .execute();
  }

  async deleteAllUsers(): Promise<void> {
    await this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .delete()
      .from(User)
      .execute();
  }
}
