import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { IUser } from '../entities/interfaces';
import { DbUser } from '../entities/db-entities/user.entity';
import { DbEmailConfirmation } from '../entities/db-entities/email-confirmation.entity';

const selectingOptionsFields = [
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

  async findUserById(userId: string = null): Promise<DbUser> {
    return this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .select(selectingOptionsFields)
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findUserByLoginOrEmail(
    userFilter: Partial<Pick<IUser, 'email' | 'login'>>,
  ): Promise<DbUser | null> {
    // return this.typeOrmUsersRepository.
    const data = await this.dataSource.query(
      ` SELECT
          "user".*,
          "emailConfirmation"."confirmationCode",
          "emailConfirmation"."isConfirmed",
          "emailConfirmation"."expirationDate"
        FROM "user"
          LEFT JOIN "emailConfirmation" ON "emailConfirmation"."userId" = "user"."id"
        WHERE "login" = $1 OR "email" = $2
      `,
      [userFilter.login, userFilter.email],
    );

    return data[0] || null;
  }

  async findUserByConfirmationCode(code: string): Promise<DbUser | null> {
    const data = await this.dataSource.query(
      ` SELECT * FROM "emailConfirmation"
        WHERE "confirmationCode" = $1
      `,
      [code],
    );

    return data[0] || null;
  }

  async findUserByPasswordRecoveryCode(code: string): Promise<DbUser | null> {
    const data = await this.dataSource.query(
      ` SELECT * FROM "user"
        WHERE "passwordRecoveryCode" = $1
      `,
      [code],
    );

    return data[0] || null;
  }

  async createUser(
    createUserDto: CreateUserDto,
    passwordHash: string,
    isConfirmed: boolean,
  ): Promise<any> {
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

    // const { login, email } = createUserDto;
    // const data = await this.dataSource.query(
    //   `INSERT INTO "user"
    //     ("login", "email", "passwordHash")
    //     VALUES ($1, $2, $3)
    //     RETURNING "id"
    //   `,
    //   [login, email, passwordHash],
    // );
    // const user = data[0];
    //
    // await this.dataSource.query(
    //   `INSERT INTO "emailConfirmation"
    //     ("userId", "confirmationCode", "isConfirmed", "expirationDate")
    //     VALUES ($1, $2, $3, $4)
    //   `,
    //   [
    //     user.id,
    //     uuidv4(),
    //     isConfirmed,
    //     add(new Date(), { hours: 1 }).toISOString(),
    //   ],
    // );
    //
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
    await this.dataSource.query(
      `DELETE FROM "emailConfirmation" WHERE "userId" = $1`,
      [userId],
    );
    await this.dataSource.query(`DELETE FROM "user" WHERE "id" = $1`, [userId]);
  }

  async deleteAllUsers(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "emailConfirmation"`);
    return this.dataSource.query(`DELETE FROM "user"`);
  }
}
