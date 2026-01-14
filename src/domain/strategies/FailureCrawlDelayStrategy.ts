
import { ICrawlDelayStrategy } from './ICrawlDelayStrategy';
import { CalculateWaitTimeUseCase } from '../usecases/CalculateWaitTimeUseCase';
import { CrawlDelayError } from '../../errors/CrawlDelayError';

export class FailureCrawlDelayStrategy implements ICrawlDelayStrategy {
    constructor(private calculateWaitTimeUseCase: CalculateWaitTimeUseCase) { }

    async execute(url: string, userAgent: string): Promise<void> {
        const { waitTime, delay } = await this.calculateWaitTimeUseCase.execute(url, userAgent);

        if (waitTime <= 0) return;

        throw new CrawlDelayError(delay);
    }
}
