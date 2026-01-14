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
    /**
     * The parsed robots.txt object.
     */
    robot: Robot;
    /**
     * Timestamp of the last crawl for this domain.
     */
    lastCrawled?: number;
}

/**
 * Service for managing robots.txt data and crawl timestamps independently of the protocol logic.
 */
export interface IRobotsDataService {
    /**
     * Retrieves the cached robot instance for a given URL.
     * @param url The URL to get the robot for (used to extract the domain/origin).
     * @param userAgent Optional user agent to use for fetching robots.txt if not cached.
     * @returns A promise resolving to the CachedRobot containing the parsed rules.
     */
    getRobot(url: string, userAgent?: string): Promise<CachedRobot>;

    /**
     * Updates the last crawled timestamp for the domain associated with the URL.
     * @param url The URL identifying the domain.
     * @param timestamp The timestamp to set.
     */
    setLastCrawled(url: string, timestamp: number): void;
}

/**
 * Service for checking if a URL is allowed to be crawled according to robots.txt rules.
 */
export interface IAllowService {
    /**
     * Checks if the given URL is allowed for the specified user agent.
     * @param url The URL to check.
     * @param userAgent The user agent to check against.
     * @returns A promise resolving to true if allowed, false otherwise.
     */
    isAllowed(url: string, userAgent?: string): Promise<boolean>;
}

/**
 * Service for handling Crawl-delay directives from robots.txt.
 */
export interface ICrawlDelayService {
    /**
     * Enforces the crawl delay for a given URL based on the compliance mode.
     * @param url The URL about to be requested.
     * @param userAgent The user agent to check rules for.
     * @param complianceMode The mode determining how to handle the delay (Await, Ignore, Failure).
     * @returns A promise that resolves when it is safe to proceed (or throws if in Failure mode).
     */
    handleCrawlDelay(url: string, userAgent: string, complianceMode: CrawlDelayComplianceMode): Promise<void>;
}
