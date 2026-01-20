/**
 * Types of caching policies for robots.txt data.
 */
export enum CachingPolicyType {
    /**
     * Cache robots.txt data indefinitely.
     */
    Indefinite = 'indefinitely',
    /**
     * Cache robots.txt data for a specific duration.
     */
    ExpireAfter = 'expireAfter'
}
