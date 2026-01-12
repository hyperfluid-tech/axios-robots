/**
 * Options for the Robots Exclusion Protocol plugin.
 */
export interface RobotsPluginOptions {
    /**
     * The User-Agent string to use when checking robots.txt rules.
     */
    userAgent: string;
}

/**
 * Interface for the Robots Service.
 */
export interface IRobotsService {
    isAllowed(url: string, userAgent?: string): Promise<boolean>;
}
