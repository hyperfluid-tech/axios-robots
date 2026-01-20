import { CachedRobot } from '../models/CachedRobot';

/**
 * Strategy interface for validating cached robots.txt data.
 */
export interface ICachingStrategy {
    /**
     * Determines whether the cached robot data is still valid.
     * @param cached The cached robot data to validate.
     * @returns True if the cache is valid, false if specific data should be refreshed.
     */
    isValid(cached: CachedRobot): boolean;
}
