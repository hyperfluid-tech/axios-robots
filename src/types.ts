import { Robot } from 'robots-parser';

/**
 * Options for the Robots Exclusion Protocol plugin.
 */
export interface RobotsPluginOptions {
    /**
     * The User-Agent string to use when checking robots.txt rules.
     */
    userAgent: string;
    complyWithCrawlDelay?: boolean;
}

export interface CachedRobot {
    robot: Robot;
    lastCrawled?: number;
}

/**
 * Interface for the Robots Service.
 */
export interface IRobotsService {
    isAllowed(url: string, userAgent?: string): Promise<boolean>;
    getRobot(url: string, userAgent?: string): Promise<CachedRobot | undefined>;
    setLastCrawled(url: string, timestamp: number): void;
}
