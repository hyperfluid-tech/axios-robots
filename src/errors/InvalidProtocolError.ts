import { RobotsError } from './RobotsError';
import { ERROR_MESSAGES } from './messages';

export class InvalidProtocolError extends RobotsError {
  constructor(protocol: string) {
    super(ERROR_MESSAGES.INVALID_PROTOCOL(protocol));
    this.name = 'InvalidProtocolError';
  }
}
