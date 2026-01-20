import { AwaitCrawlDelayStrategy } from "../../../../../src/domain/strategies/crawl-delay/AwaitCrawlDelayStrategy";
import { CalculateWaitTimeUseCase } from "../../../../../src/domain/usecases/CalculateWaitTimeUseCase";

describe('AwaitCrawlDelayStrategy', () => {
    let strategy: AwaitCrawlDelayStrategy;
    let mockUseCase: jest.Mocked<CalculateWaitTimeUseCase>;

    beforeEach(() => {
        mockUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<CalculateWaitTimeUseCase>;
        strategy = new AwaitCrawlDelayStrategy(mockUseCase);
        jest.useFakeTimers({
            doNotFake: ['nextTick', 'setImmediate']
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test(`
GIVEN wait time is 0
WHEN executing strategy
THEN it should return immediately without waiting
    `, async () => {
        mockUseCase.execute.mockResolvedValue({ waitTime: 0, delay: 5 });
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

        await strategy.execute('https://example.com', '*');

        expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    test(`
GIVEN wait time is greater than 0
WHEN executing strategy
THEN it should wait for the specified time
    `, async () => {
        const waitTime = 1000;
        mockUseCase.execute.mockResolvedValue({ waitTime, delay: 5 });

        const executePromise = strategy.execute('https://example.com', '*');

        await Promise.resolve();
        await Promise.resolve();

        jest.advanceTimersByTime(waitTime);
        
        await executePromise;
    });
});
