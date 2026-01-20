import { RequestCountCachingStrategy } from '../../../../../src/domain/strategies/caching/RequestCountCachingStrategy';
import { CachedRobot } from '../../../../../src/domain/models/CachedRobot';

describe('RequestCountCachingStrategy', () => {
    let strategy: RequestCountCachingStrategy;
    const maxRequests = 5;

    beforeEach(() => {
        strategy = new RequestCountCachingStrategy(maxRequests);
    });

    test(`
    GIVEN usage count is less than max requests
    WHEN validating cached robot
    THEN it should return true
    `, () => {
        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: Date.now(),
            usageCount: 4
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(true);
    });

    test(`
    GIVEN usage count is equal to max requests
    WHEN validating cached robot
    THEN it should return false
    `, () => {
        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: Date.now(),
            usageCount: 5
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(false);
    });

    test(`
    GIVEN usage count is greater than max requests
    WHEN validating cached robot
    THEN it should return false
    `, () => {
        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: Date.now(),
            usageCount: 6
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(false);
    });

    test(`
    GIVEN usage count is undefined
    WHEN validating cached robot
    THEN it should treat it as 0 and return true
    `, () => {
        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: Date.now()
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(true);
    });
});
