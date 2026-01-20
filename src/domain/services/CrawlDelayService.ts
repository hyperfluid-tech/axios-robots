import { CrawlDelayComplianceMode } from '../models/CrawlDelayComplianceMode';
import { ICrawlDelayService } from '../interfaces/ICrawlDelayService';
import { IRobotsDataRepository } from '../interfaces/IRobotsDataRepository';
import { CalculateWaitTimeUseCase } from '../usecases/CalculateWaitTimeUseCase';
import { CrawlDelayStrategyFactory } from '../strategies/crawl-delay/CrawlDelayStrategyFactory';

export class CrawlDelayService implements ICrawlDelayService {
    private calculateWaitTimeUseCase: CalculateWaitTimeUseCase;
    private strategyFactory: CrawlDelayStrategyFactory;

    constructor(private dataService: IRobotsDataRepository) {
        this.calculateWaitTimeUseCase = new CalculateWaitTimeUseCase(dataService);
        this.strategyFactory = new CrawlDelayStrategyFactory(this.calculateWaitTimeUseCase);
    }

    async handleCrawlDelay(
        url: string, 
        userAgent: string, 
        complianceMode: CrawlDelayComplianceMode
    ): Promise<void> {
        const strategy = this.strategyFactory.getStrategy(complianceMode);
        await strategy.execute(url, userAgent);
    }
}
