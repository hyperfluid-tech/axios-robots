import { CachingStrategyFactory } from '../../../../../src/domain/strategies/caching/CachingStrategyFactory';
import { IndefiniteCachingStrategy } from '../../../../../src/domain/strategies/caching/IndefiniteCachingStrategy';
import { ExpireAfterCachingStrategy } from '../../../../../src/domain/strategies/caching/ExpireAfterCachingStrategy';
import { RequestCountCachingStrategy } from '../../../../../src/domain/strategies/caching/RequestCountCachingStrategy';
import { CachingPolicyType } from '../../../../../src/domain/models/CachingPolicyType';

describe('CachingStrategyFactory', () => {
    let factory: CachingStrategyFactory;

    beforeEach(() => {
        factory = new CachingStrategyFactory();
    });

    test(`
    GIVEN an indefinite caching policy
    WHEN requesting a strategy
    THEN it should return an IndefiniteCachingStrategy instance
    `, () => {
        const policy = { type: CachingPolicyType.Indefinite } as const;

        const strategy = factory.getStrategy(policy);

        expect(strategy).toBeInstanceOf(IndefiniteCachingStrategy);
    });

    test(`
    GIVEN an expireAfter caching policy
    WHEN requesting a strategy
    THEN it should return an ExpireAfterCachingStrategy instance
    `, () => {
        const policy = { type: CachingPolicyType.ExpireAfter, duration: '1h' } as const;

        const strategy = factory.getStrategy(policy);

        expect(strategy).toBeInstanceOf(ExpireAfterCachingStrategy);
    });

    test(`
    GIVEN a requestCount caching policy
    WHEN requesting a strategy
    THEN it should return a RequestCountCachingStrategy instance
    `, () => {
        const policy = { type: CachingPolicyType.RequestCount, maxRequests: 5 } as const;

        const strategy = factory.getStrategy(policy);

        expect(strategy).toBeInstanceOf(RequestCountCachingStrategy);
    });

    test(`
    GIVEN an unknown caching policy type
    WHEN requesting a strategy
    THEN it should return an IndefiniteCachingStrategy instance (default)
    `, () => {
        // Casting to any to simulate invalid input that might bypass type checking or come from external sources
        const policy = { type: 'unknown' as any };

        const strategy = factory.getStrategy(policy);

        expect(strategy).toBeInstanceOf(IndefiniteCachingStrategy);
    });
});
