import { Response } from 'express';
import { NotFoundError } from '../../../core/domain/errors/not-found-error';

export function handleControllerError(
  error: unknown,
  res: Response,
  defaultMessage: string
) {
  if (error instanceof NotFoundError) {
    return res.status(404).send(error.message);
  }
  return res.status(500).send(defaultMessage);
}
