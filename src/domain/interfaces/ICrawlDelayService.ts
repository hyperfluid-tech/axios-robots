import { CrawlDelayComplianceMode } from '../models/CrawlDelayComplianceMode';

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
