import { RobotsError } from './RobotsError';
import { ERROR_MESSAGES } from './messages';

export class RobotsDeniedError extends RobotsError {
  constructor(url: string, userAgent: string) {
    super(ERROR_MESSAGES.ROBOTS_DENIED(url, userAgent));
    this.name = 'RobotsDeniedError';
  }
}
