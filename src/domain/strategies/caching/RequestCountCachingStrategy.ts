import { ICachingStrategy } from './ICachingStrategy';
import { CachedRobot } from '../../models/CachedRobot';

export class RequestCountCachingStrategy implements ICachingStrategy {
    private maxRequests: number;

    constructor(maxRequests: number) {
        this.maxRequests = maxRequests;
    }

    isValid(cached: CachedRobot): boolean {
        return (cached.usageCount || 0) < this.maxRequests;
    }
}
