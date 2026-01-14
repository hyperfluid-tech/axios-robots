import { IgnoreCrawlDelayStrategy } from '../../../../src/domain/strategies/IgnoreCrawlDelayStrategy';

describe('IgnoreCrawlDelayStrategy', () => {
    let strategy: IgnoreCrawlDelayStrategy;

    beforeEach(() => {
        strategy = new IgnoreCrawlDelayStrategy();
    });

    test(`
GIVEN any conditions
WHEN executing strategy
THEN it should return successfully (no op)
    `, async () => {
        await expect(strategy.execute('https://example.com', '*')).resolves.not.toThrow();
    });
});
