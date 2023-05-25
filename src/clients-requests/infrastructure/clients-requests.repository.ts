import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IClientRequest } from '../entities/interfaces';
import { ClientRequestEntity } from '../entities/db-entities/client-request.entity';

@Injectable()
export class ClientsRequestsRepository {
  constructor(
    @InjectRepository(ClientRequestEntity)
    private typeOrmClientRequestRepository: Repository<ClientRequestEntity>,
  ) {}

  async getClientRequestsByFilter(
    ip: string,
    endpoint: string,
  ): Promise<IClientRequest[]> {
    return this.typeOrmClientRequestRepository
      .createQueryBuilder('clientRequest')
      .select('clientRequest')
      .where('clientRequest.ip = :ip', { ip })
      .andWhere('clientRequest.endpoint = :endpoint', { endpoint })
      .getMany();
  }

  async createClientRequest(
    ip: string,
    endpoint: string,
    createTimeStamp: number,
  ): Promise<ClientRequestEntity> {
    const createdUserData = await this.typeOrmClientRequestRepository
      .createQueryBuilder()
      .insert()
      .into(ClientRequestEntity)
      .values({ ip, endpoint, createTimeStamp })
      .returning('id')
      .execute();

    return createdUserData.identifiers[0].id;
  }

  async updateClientRequest(
    clientRequestId: string,
    createTimeStamp: number,
  ): Promise<void> {
    await this.typeOrmClientRequestRepository
      .createQueryBuilder()
      .update(ClientRequestEntity)
      .set({ createTimeStamp })
      .where('id = :clientRequestId', { clientRequestId })
      .execute();
  }

  async updateManyClientsRequestsByFilter(
    ip: string,
    endpoint: string,
    createTimeStamp: number,
  ): Promise<void> {
    await this.typeOrmClientRequestRepository
      .createQueryBuilder()
      .update(ClientRequestEntity)
      .set({ createTimeStamp })
      .where('ip = :ip', { ip })
      .andWhere('endpoint = :endpoint', { endpoint })
      .execute();
  }

  async deleteAllClientRequests(): Promise<void> {
    await this.typeOrmClientRequestRepository
      .createQueryBuilder()
      .delete()
      .from(ClientRequestEntity)
      .execute();
  }
}
