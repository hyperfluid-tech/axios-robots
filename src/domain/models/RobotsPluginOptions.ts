import { CrawlDelayComplianceMode } from './CrawlDelayComplianceMode';
import { CachingPolicy } from './CachingPolicy';

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
    /**
     * How to handle caching of robots.txt data.
     * Defaults to indefinitely.
     */
    cachingPolicy?: CachingPolicy;
}
