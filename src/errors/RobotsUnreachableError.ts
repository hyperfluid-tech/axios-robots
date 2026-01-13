import { RobotsError } from './RobotsError';
import { ERROR_MESSAGES } from './messages';

export class RobotsUnreachableError extends RobotsError {
  constructor(details: string) {
    super(ERROR_MESSAGES.ROBOTS_UNREACHABLE(details));
    this.name = 'RobotsUnreachableError';
  }
}
