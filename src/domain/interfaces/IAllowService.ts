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
