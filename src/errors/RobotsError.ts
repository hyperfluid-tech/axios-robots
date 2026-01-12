import { ERROR_MESSAGES } from './messages';

export class RobotsError extends Error {
  constructor(message: string = ERROR_MESSAGES.DEFAULT_BLOCK) {
    super(message);
    this.name = 'RobotsError';
  }
}
