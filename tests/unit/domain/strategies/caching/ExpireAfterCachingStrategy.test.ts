import { ExpireAfterCachingStrategy } from '../../../../../src/domain/strategies/caching/ExpireAfterCachingStrategy';
import { CachedRobot } from '../../../../../src/domain/models/CachedRobot';

describe('ExpireAfterCachingStrategy', () => {
    
    test(`
    GIVEN cached data is not expired
    WHEN validating cached robot
    THEN it should return true
    `, () => {
        const duration = 1000;
        const strategy = new ExpireAfterCachingStrategy(duration);
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: now - 500
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(true);
    });

    test(`
    GIVEN cached data is expired
    WHEN validating cached robot
    THEN it should return false
    `, () => {
        const duration = 1000;
        const strategy = new ExpireAfterCachingStrategy(duration);
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        const cached: CachedRobot = {
            robot: {} as any,
            fetchedAt: now - 1500
        };

        const result = strategy.isValid(cached);

        expect(result).toBe(false);
    });

    test(`
    GIVEN duration is provided as a string
    WHEN validating cached robot
    THEN it should parse the string and validate correctly
    `, () => {
        const duration = '1s';
        const strategy = new ExpireAfterCachingStrategy(duration);
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        // Not expired (500ms < 1s)
        const cachedValid: CachedRobot = {
            robot: {} as any,
            fetchedAt: now - 500
        };
        expect(strategy.isValid(cachedValid)).toBe(true);

        // Expired (1500ms > 1s)
        const cachedExpired: CachedRobot = {
            robot: {} as any,
            fetchedAt: now - 1500
        };
        expect(strategy.isValid(cachedExpired)).toBe(false);
    });
});
