import { Robot } from 'robots-parser';

/**
 * Options for the Robots Exclusion Protocol plugin.
 */
export enum CrawlDelayComplianceMode {
    /**
     * Respects the Crawl-delay directive by waiting before making the request.
     */
    Await = 'await',
    /**
     * Ignores the Crawl-delay directive.
     */
    Ignore = 'ignore'
}

export interface RobotsPluginOptions {
    /**
     * The User-Agent string to use when checking robots.txt rules.
     */
    userAgent: string;
    /**
     * How to handle Crawl-delay directives.
     * Defaults to CrawlDelayComplianceMode.Await
     */
    crawlDelayCompliance?: CrawlDelayComplianceMode;
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
