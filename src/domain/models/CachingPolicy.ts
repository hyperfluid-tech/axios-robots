import { CachingPolicyType } from './CachingPolicyType';

export type CachingPolicy = IndefiniteCachingPolicy | ExpireAfterCachingPolicy | RequestCountCachingPolicy;

export interface IndefiniteCachingPolicy {
    type: CachingPolicyType.Indefinite;
}

export interface ExpireAfterCachingPolicy {
    type: CachingPolicyType.ExpireAfter;
    /**
     * Duration in milliseconds or a string format supported by the 'ms' library (e.g., '1h', '5m').
     */
    duration: string | number;
}

export interface RequestCountCachingPolicy {
    type: CachingPolicyType.RequestCount;
    /**
     * Maximum number of requests before the cache expires.
     */
    maxRequests: number;
}

