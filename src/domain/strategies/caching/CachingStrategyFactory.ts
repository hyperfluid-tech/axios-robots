import { CachingPolicy } from '../../models/CachingPolicy';
import { CachingPolicyType } from '../../models/CachingPolicyType';
import { ICachingStrategy } from './ICachingStrategy';
import { IndefiniteCachingStrategy } from './IndefiniteCachingStrategy';
import { ExpireAfterCachingStrategy } from './ExpireAfterCachingStrategy';

export class CachingStrategyFactory {
    getStrategy(policy: CachingPolicy): ICachingStrategy {
        switch (policy.type) {
            case CachingPolicyType.Indefinite:
                return new IndefiniteCachingStrategy();
            case CachingPolicyType.ExpireAfter:
                return new ExpireAfterCachingStrategy(policy.duration);
            default:
                return new IndefiniteCachingStrategy();
        }
    }
}
