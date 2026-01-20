import { ICachingStrategy } from './ICachingStrategy';
import { CachedRobot } from '../models/CachedRobot';

export class IndefiniteCachingStrategy implements ICachingStrategy {
    isValid(cached: CachedRobot): boolean {
        return true;
    }
}
