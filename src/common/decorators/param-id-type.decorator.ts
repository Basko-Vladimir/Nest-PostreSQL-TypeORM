import { IdTypes } from '../enums';
import { SetMetadata } from '@nestjs/common';

export const ParamIdType = (ids: IdTypes[]) => SetMetadata('idTypes', ids);
