import robotsParser, { Robot } from 'robots-parser';
import axios from 'axios';
import { HEADER_USER_AGENT, ROBOTS_TXT_FILENAME, ALLOW_ALL_ROBOTS_TXT_CONTENT } from '../constants';
import { RobotsUnreachableError } from '../errors/RobotsUnreachableError';

import { IRobotsService, CachedRobot } from '../types';

export class RobotsService implements IRobotsService {
    private cache: Map<string, CachedRobot> = new Map();

    /**
     * Checks if the given URL is allowed for the specified User-Agent.
     * Fetching and caching the robots.txt is handled automatically.
     */
    async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
        const robot = await this.getRobot(url, userAgent);

        if (!robot) {
            // Should not happen as getRobot handles fetching, but safety check
            return true;
        }

        return robot.robot.isAllowed(url, userAgent) ?? true;
    }

    /**
     * Retrieves the cached robot rules for the given URL's origin.
     * Fetches from the network if not already cached.
     */
    async getRobot(url: string, userAgent: string = '*'): Promise<CachedRobot | undefined> {
        const origin = new URL(url).origin;
        let cached = this.cache.get(origin);

        if (cached)
            return cached;

        const robot = await this.fetchRobotsTxt(origin, userAgent);
        cached = { robot };
        this.cache.set(origin, cached);

        return cached;
    }

    /**
     * Updates the last crawled timestamp for the given URL's origin.
     */
    setLastCrawled(url: string, timestamp: number): void {
        const origin = new URL(url).origin;
        const cached = this.cache.get(origin);
        if (cached) {
            cached.lastCrawled = timestamp;
        }
    }

    private async fetchRobotsTxt(origin: string, userAgent: string): Promise<Robot> {
        const robotsUrl = `${origin}/${ROBOTS_TXT_FILENAME}`;

        const internalClient = axios.create({
            headers: {
                [HEADER_USER_AGENT]: userAgent,
            }
        });

        try {
            const response = await internalClient.get(robotsUrl);
            return robotsParser(robotsUrl, response.data);
        } catch (error: any) {
            if (this.isUnavailable(error)) {
                return robotsParser(robotsUrl, ALLOW_ALL_ROBOTS_TXT_CONTENT);
            }

            throw new RobotsUnreachableError(error.message);
        }
    }

    private isUnavailable(error: any): boolean {
        return error.response && error.response.status >= 400 && error.response.status < 500;
    }
}
