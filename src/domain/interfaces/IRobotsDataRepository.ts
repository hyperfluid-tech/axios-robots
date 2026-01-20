import { CachedRobot } from '../models/CachedRobot';

/**
 * Repository for managing robots.txt data and crawl timestamps independently of the protocol logic.
 */
export interface IRobotsDataRepository {
    /**
     * Retrieves the cached robot instance for a given URL.
     * @param url The URL to get the robot for (used to extract the domain/origin).
     * @param userAgent Optional user agent to use for fetching robots.txt if not cached.
     * @returns A promise resolving to the CachedRobot containing the parsed rules.
     */
    getRobot(url: string, userAgent?: string): Promise<CachedRobot>;

    /**
     * Retrieves the robot from cache if available, without fetching or validating against strategy.
     * @param url The URL to retrieve the robot for.
     */
    getCachedRobot(url: string): CachedRobot | undefined;

    /**
     * Increments the usage count for the cached robot associated with the URL.
     * @param url The URL identifying the domain.
     */
    incrementUsage(url: string): void;

    /**
     * Updates the last crawled timestamp for the domain associated with the URL.
     * @param url The URL identifying the domain.
     * @param timestamp The timestamp to set.
     */
    setLastCrawled(url: string, timestamp: number): void;
}
