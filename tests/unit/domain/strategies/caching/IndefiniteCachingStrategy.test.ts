import { IndefiniteCachingStrategy } from '../../../../../src/domain/strategies/caching/IndefiniteCachingStrategy';
import { CachedRobot } from '../../../../../src/domain/models/CachedRobot';

describe('IndefiniteCachingStrategy', () => {
    let strategy: IndefiniteCachingStrategy;

    beforeEach(() => {
        strategy = new IndefiniteCachingStrategy();
    });

    test(`
    GIVEN any cached data
    WHEN validating cached robot
    THEN it should always return true
    `, () => {
        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: Date.now() - 10000000 // Old data
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(true);
    });
});
