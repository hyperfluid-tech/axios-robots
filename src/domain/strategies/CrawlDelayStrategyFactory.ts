
import { CrawlDelayComplianceMode } from '../models/CrawlDelayComplianceMode';
import { ICrawlDelayStrategy } from './ICrawlDelayStrategy';
import { CalculateWaitTimeUseCase } from '../usecases/CalculateWaitTimeUseCase';
import { AwaitCrawlDelayStrategy } from './AwaitCrawlDelayStrategy';
import { FailureCrawlDelayStrategy } from './FailureCrawlDelayStrategy';
import { IgnoreCrawlDelayStrategy } from './IgnoreCrawlDelayStrategy';

export class CrawlDelayStrategyFactory {
    constructor(private calculateWaitTimeUseCase: CalculateWaitTimeUseCase) { }

    getStrategy(mode: CrawlDelayComplianceMode): ICrawlDelayStrategy {
        switch (mode) {
            case CrawlDelayComplianceMode.Failure:
                return new FailureCrawlDelayStrategy(this.calculateWaitTimeUseCase);
            case CrawlDelayComplianceMode.Ignore:
                return new IgnoreCrawlDelayStrategy();
            case CrawlDelayComplianceMode.Await:
                return new AwaitCrawlDelayStrategy(this.calculateWaitTimeUseCase);
        }
    }
}
