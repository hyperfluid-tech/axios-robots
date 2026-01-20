import ms from 'ms';
import { ICachingStrategy } from './ICachingStrategy';
import { CachedRobot } from '../../models/CachedRobot';

export class ExpireAfterCachingStrategy implements ICachingStrategy {
    private durationMs: number;

    constructor(duration: string | number) {
        if (typeof duration === 'string') {
            this.durationMs = ms(duration as any) as unknown as number;
            return;
        }
        this.durationMs = duration;
    }

    isValid(cached: CachedRobot): boolean {
        const now = Date.now();
        const expirationTime = cached.fetchedAt + this.durationMs;
        return now < expirationTime;
    }
}
