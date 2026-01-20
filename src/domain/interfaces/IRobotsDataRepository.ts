import { CachedRobot } from '../models/CachedRobot';

/**
 * Repository for managing robots.txt data and crawl timestamps independently of the protocol logic.
 */
export interface IRobotsDataRepository {
    /**
     * Retrieves the cached robot instance for a given URL.
     * @param url The URL to get the robot for (used to extract the domain/origin).
     * @param userAgent Optional user agent to use for fetching robots.txt if not cached.
     * @param options Optional retrieval options.
     * @returns A promise resolving to the CachedRobot containing the parsed rules.
     */
    getRobot(url: string, userAgent?: string, options?: { incrementUsage?: boolean; ignoreCachePolicy?: boolean; }): Promise<CachedRobot>;

    /**
     * Updates the last crawled timestamp for the domain associated with the URL.
     * @param url The URL identifying the domain.
     * @param timestamp The timestamp to set.
     */
    setLastCrawled(url: string, timestamp: number): void;
}
