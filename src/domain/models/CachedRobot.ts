import { Robot } from 'robots-parser';

export interface CachedRobot {
    /**
     * The parsed robots.txt object.
     */
    robot: Robot;
    /**
     * Timestamp of the last crawl for this domain.
     */
    lastCrawled?: number;
    /**
     * Timestamp of when the robots.txt was fetched.
     */
    fetchedAt: number;
    /**
     * Number of times this cached robot has been accessed.
     */
    usageCount?: number;
}
