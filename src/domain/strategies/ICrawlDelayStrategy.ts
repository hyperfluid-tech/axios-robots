
/**
 * Strategy for ensuring compliance with Crawl-delay rules.
 */
export interface ICrawlDelayStrategy {
    /**
     * Executes the strategy for a given URL and user agent.
     * @param url The URL about to be crawled.
     * @param userAgent The user agent for which to check the rules.
     */
    execute(url: string, userAgent: string): Promise<void>;
}
