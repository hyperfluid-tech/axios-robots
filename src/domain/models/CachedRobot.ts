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
}
