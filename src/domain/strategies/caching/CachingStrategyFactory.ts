import { CachingPolicy } from '../../models/CachingPolicy';
import { CachingPolicyType } from '../../models/CachingPolicyType';
import { ICachingStrategy } from './ICachingStrategy';
import { IndefiniteCachingStrategy } from './IndefiniteCachingStrategy';
import { ExpireAfterCachingStrategy } from './ExpireAfterCachingStrategy';
import { RequestCountCachingStrategy } from './RequestCountCachingStrategy';

export class CachingStrategyFactory {
    getStrategy(policy: CachingPolicy): ICachingStrategy {
        switch (policy.type) {
            case CachingPolicyType.Indefinite:
                return new IndefiniteCachingStrategy();
            case CachingPolicyType.ExpireAfter:
                return new ExpireAfterCachingStrategy(policy.duration);
            case CachingPolicyType.RequestCount:
                return new RequestCountCachingStrategy(policy.maxRequests);
        }
    }
}
