import { FailureCrawlDelayStrategy } from '../../../../../src/domain/strategies/crawl-delay/FailureCrawlDelayStrategy';
import { CalculateWaitTimeUseCase } from '../../../../../src/domain/usecases/CalculateWaitTimeUseCase';
import { CrawlDelayError } from '../../../../../src/errors/CrawlDelayError';

describe('FailureCrawlDelayStrategy', () => {
    let strategy: FailureCrawlDelayStrategy;
    let mockUseCase: jest.Mocked<CalculateWaitTimeUseCase>;

    beforeEach(() => {
        mockUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<CalculateWaitTimeUseCase>;
        strategy = new FailureCrawlDelayStrategy(mockUseCase);
    });

    test(`
GIVEN wait time is 0
WHEN executing strategy
THEN it should return successfully
    `, async () => {
        mockUseCase.execute.mockResolvedValue({ waitTime: 0, delay: 5 });

        await expect(strategy.execute('https://example.com', '*')).resolves.not.toThrow();
    });

    test(`
GIVEN wait time is greater than 0
WHEN executing strategy
THEN it should throw a CrawlDelayError
    `, async () => {
        mockUseCase.execute.mockResolvedValue({ waitTime: 1000, delay: 5 });

        await expect(strategy.execute('https://example.com', '*')).rejects.toThrow(CrawlDelayError);
    });
});
