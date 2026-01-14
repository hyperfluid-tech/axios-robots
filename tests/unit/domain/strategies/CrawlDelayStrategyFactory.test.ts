import { CrawlDelayStrategyFactory } from '../../../../src/domain/strategies/CrawlDelayStrategyFactory';
import { AwaitCrawlDelayStrategy } from '../../../../src/domain/strategies/AwaitCrawlDelayStrategy';
import { FailureCrawlDelayStrategy } from '../../../../src/domain/strategies/FailureCrawlDelayStrategy';
import { IgnoreCrawlDelayStrategy } from '../../../../src/domain/strategies/IgnoreCrawlDelayStrategy';
import { CrawlDelayComplianceMode } from '../../../../src/domain/models/CrawlDelayComplianceMode';
import { CalculateWaitTimeUseCase } from '../../../../src/domain/usecases/CalculateWaitTimeUseCase';

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
