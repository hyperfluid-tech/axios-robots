import { CrawlDelayComplianceMode } from "../../../../../src";
import { AwaitCrawlDelayStrategy } from "../../../../../src/domain/strategies/crawl-delay/AwaitCrawlDelayStrategy";
import { CrawlDelayStrategyFactory } from "../../../../../src/domain/strategies/crawl-delay/CrawlDelayStrategyFactory";
import { FailureCrawlDelayStrategy } from "../../../../../src/domain/strategies/crawl-delay/FailureCrawlDelayStrategy";
import { IgnoreCrawlDelayStrategy } from "../../../../../src/domain/strategies/crawl-delay/IgnoreCrawlDelayStrategy";
import { CalculateWaitTimeUseCase } from "../../../../../src/domain/usecases/CalculateWaitTimeUseCase";

describe('CrawlDelayStrategyFactory', () => {
    let factory: CrawlDelayStrategyFactory;
    let mockUseCase: CalculateWaitTimeUseCase;

    beforeEach(() => {
        mockUseCase = {} as CalculateWaitTimeUseCase;
        factory = new CrawlDelayStrategyFactory(mockUseCase);
    });

    test(`
GIVEN mode is Await
WHEN getting strategy
THEN it should return AwaitCrawlDelayStrategy
    `, () => {
        const strategy = factory.getStrategy(CrawlDelayComplianceMode.Await);
        expect(strategy).toBeInstanceOf(AwaitCrawlDelayStrategy);
    });

    test(`
GIVEN mode is Failure
WHEN getting strategy
THEN it should return FailureCrawlDelayStrategy
    `, () => {
        const strategy = factory.getStrategy(CrawlDelayComplianceMode.Failure);
        expect(strategy).toBeInstanceOf(FailureCrawlDelayStrategy);
    });

    test(`
GIVEN mode is Ignore
WHEN getting strategy
THEN it should return IgnoreCrawlDelayStrategy
    `, () => {
        const strategy = factory.getStrategy(CrawlDelayComplianceMode.Ignore);
        expect(strategy).toBeInstanceOf(IgnoreCrawlDelayStrategy);
    });
});
