import { RobotsError } from './RobotsError';
import { ERROR_MESSAGES } from './messages';

export class InvalidUrlError extends RobotsError {
  constructor(details: string) {
    super(ERROR_MESSAGES.INVALID_URL(details));
    this.name = 'InvalidUrlError';
  }
}
