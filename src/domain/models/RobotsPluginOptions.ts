import { CrawlDelayComplianceMode } from './CrawlDelayComplianceMode';

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
