import { CrawlDelayComplianceMode } from '../models/CrawlDelayComplianceMode';
import { ICrawlDelayService } from '../interfaces/ICrawlDelayService';
import { IRobotsDataService } from '../interfaces/IRobotsDataService';
import { CalculateWaitTimeUseCase } from '../usecases/CalculateWaitTimeUseCase';
import { CrawlDelayStrategyFactory } from '../strategies/CrawlDelayStrategyFactory';

export class CrawlDelayService implements ICrawlDelayService {
    private calculateWaitTimeUseCase: CalculateWaitTimeUseCase;
    private strategyFactory: CrawlDelayStrategyFactory;

    constructor(private dataService: IRobotsDataService) {
        this.calculateWaitTimeUseCase = new CalculateWaitTimeUseCase(dataService);
        this.strategyFactory = new CrawlDelayStrategyFactory(this.calculateWaitTimeUseCase);
    }

    /**
     * Handles the crawl delay for the given URL and user agent.
     * Enforces the delay based on the compliance mode.
     */
    async handleCrawlDelay(
        url: string, 
        userAgent: string, 
        complianceMode: CrawlDelayComplianceMode
    ): Promise<void> {
        const strategy = this.strategyFactory.getStrategy(complianceMode);
        await strategy.execute(url, userAgent);
    }
}
