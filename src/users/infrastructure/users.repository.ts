import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { DbUser } from '../entities/db-entities/user.entity';
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
    @InjectRepository(DbUser)
    private typeOrmUsersRepository: Repository<DbUser>,
    @InjectRepository(DbEmailConfirmation)
    private typeOrmEmailConfirmationRepository: Repository<DbEmailConfirmation>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findUserById(userId: string = null): Promise<DbUser | null> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findUserByLoginOrEmail(
    userFilter: Partial<Pick<DbUser, 'email' | 'login'>>,
  ): Promise<DbUser | null> {
    const { email, login } = userFilter;

    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('user.email = :email', { email })
      .orWhere('user.login = "login', { login })
      .getOne();
  }

  async findUserByConfirmationCode(code: string): Promise<DbUser | null> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingUsersFields)
      .where('emailConfirmation.confirmationCode = :code', { code })
      .getOne();
  }

  async findUserByPasswordRecoveryCode(code: string): Promise<DbUser | null> {
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
  ): Promise<DbUser> {
    const { login, email } = createUserDto;
    const createdUser = this.typeOrmUsersRepository.create({
      login,
      email,
      passwordHash,
    });
    const savedUser = await this.typeOrmUsersRepository.save(createdUser);
    const createdEmailConfirmation =
      this.typeOrmEmailConfirmationRepository.create({
        userId: savedUser.id,
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      });

    await this.typeOrmEmailConfirmationRepository.save(
      createdEmailConfirmation,
    );

    return this.findUserById(savedUser.id);
  }

  async updateUserBanStatus(
    userId: string,
    shouldBan: boolean,
    reason: string,
  ): Promise<any> {
    const banReason = shouldBan ? reason : null;

    await this.dataSource.query(
      `UPDATE "user"
        SET "isBanned" = $1, "banReason" = $2, "banDate" =
          (CASE
            WHEN $1 = true THEN NOW()
            ELSE NULL
          END)
        WHERE "id" = $3
      `,
      [shouldBan, banReason, userId],
    );
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
    await this.typeOrmEmailConfirmationRepository.delete({ userId });
    await this.typeOrmUsersRepository.delete(userId);
  }

  async deleteAllUsers(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "emailConfirmation"`);
    return this.dataSource.query(`DELETE FROM "user"`);
  }
}
