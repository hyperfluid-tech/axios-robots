
import { ICrawlDelayStrategy } from './ICrawlDelayStrategy';
import { CalculateWaitTimeUseCase } from '../../usecases/CalculateWaitTimeUseCase';

export class AwaitCrawlDelayStrategy implements ICrawlDelayStrategy {
    constructor(private calculateWaitTimeUseCase: CalculateWaitTimeUseCase) { }

    async execute(url: string, userAgent: string): Promise<void> {
        const { waitTime } = await this.calculateWaitTimeUseCase.execute(url, userAgent);

        if (waitTime <= 0)
            return;


        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
}
