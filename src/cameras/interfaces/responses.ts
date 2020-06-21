import { HttpStatus } from '@nestjs/common';

export interface ResponseError {
  statusCode: HttpStatus;
  error?: string;
  message: string;
}

export interface ResponseOK {
  statusCode: HttpStatus;
  dataOutput: object|boolean;
}

export interface EntityUpdated {
  n: number;
  nModified: string;
  ok: boolean;
}

export interface EntityDeleted {
  n?: number;
  deletedCount?: number;
  ok?: boolean;
}
