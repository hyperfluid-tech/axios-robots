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
