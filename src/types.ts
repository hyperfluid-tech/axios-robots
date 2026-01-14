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
    Ignore = 'ignore',
    /**
     * Throws an error if the request violates the Crawl-delay.
     */
    Failure = 'failure'
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

export interface IRobotsDataService {
    getRobot(url: string, userAgent?: string): Promise<CachedRobot>;
    setLastCrawled(url: string, timestamp: number): void;
}

export interface IAllowService {
    isAllowed(url: string, userAgent?: string): Promise<boolean>;
}

export interface ICrawlDelayService {
    handleCrawlDelay(url: string, userAgent: string, complianceMode: CrawlDelayComplianceMode): Promise<void>;
}
