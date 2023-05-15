import { Injectable } from '@nestjs/common';
import { generateCustomBadRequestException } from '../utils';
import { ParseUUIDPipe } from '@nestjs/common/pipes/parse-uuid.pipe';

@Injectable()
export class CheckParamUUIDPipe extends ParseUUIDPipe {
  async transform(id: string): Promise<string> {
    if (this.isUUID(id, '4')) {
      return id;
    }

    generateCustomBadRequestException('Invalid paramId', 'paramId');
  }
}
