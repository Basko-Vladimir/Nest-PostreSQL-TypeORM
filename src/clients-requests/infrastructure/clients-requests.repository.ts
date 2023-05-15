import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IClientRequest } from '../entities/interfaces';

@Injectable()
export class ClientsRequestsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getClientRequestsByFilter(
    ip: string,
    endpoint: string,
  ): Promise<IClientRequest[]> {
    return await this.dataSource.query(
      `SELECT *
       FROM "clientRequest"
       WHERE "ip" = $1 AND "endpoint" = $2
      `,
      [ip, endpoint],
    );
  }

  async createClientRequest(
    ip: string,
    endpoint: string,
    createTimeStamp: number,
  ): Promise<IClientRequest> {
    const data = await this.dataSource.query(
      `INSERT INTO "clientRequest"
        ("ip", "endpoint", "createTimeStamp")
        VALUES ($1, $2, ${createTimeStamp})
        RETURNING id
      `,
      [ip, endpoint],
    );

    return data[0].id;
  }

  async updateClientRequest(
    clientRequestId: string,
    createTimeStamp: number,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "clientRequest"
        SET "createTimeStamp" = $1
        WHERE "id" = $2
      `,
      [createTimeStamp, clientRequestId],
    );
  }

  async updateManyClientsRequestsByFilter(
    ip: string,
    endpoint: string,
    createTimeStamp: number,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "clientRequest"
        SET "createTimeStamp" = $1
        WHERE "ip" = $2 AND "endpoint" = $3
      `,
      [createTimeStamp, ip, endpoint],
    );
  }

  async deleteAllClientRequests(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "clientRequest"`);
  }
}
