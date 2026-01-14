
import { ICrawlDelayStrategy } from './ICrawlDelayStrategy';

export class IgnoreCrawlDelayStrategy implements ICrawlDelayStrategy {
    async execute(url: string, userAgent: string): Promise<void> {
        return;
    }
}
