import { RobotsError } from './RobotsError';
import { ERROR_MESSAGES } from './messages';

export class CrawlDelayError extends RobotsError {
  constructor(delay: number) {
    super(ERROR_MESSAGES.ROBOTS_CRAWL_DELAY(delay));
    this.name = 'CrawlDelayError';
  }
}
