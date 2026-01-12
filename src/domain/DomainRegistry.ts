import robotsParser, { Robot } from 'robots-parser';
import axios from 'axios';
import { HEADER_USER_AGENT, ROBOTS_TXT_FILENAME, ALLOW_ALL_ROBOTS_TXT_CONTENT } from '../constants';
import { RobotsError } from '../errors/RobotsError';
import { ERROR_MESSAGES } from '../errors/messages';

export class DomainRegistry {
    private cache: Map<string, Robot> = new Map();

    /**
     * Checks if the given URL is allowed for the specified User-Agent.
     * Fetching and caching the robots.txt is handled automatically.
     */
    async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
        const origin = new URL(url).origin;
        let robot = this.cache.get(origin);

        if (!robot) {
            robot = await this.fetchRobotsTxt(origin, userAgent);
            this.cache.set(origin, robot);
        }

        return robot.isAllowed(url, userAgent) ?? true;
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

            throw new RobotsError(ERROR_MESSAGES.ROBOTS_UNREACHABLE(error.message));
        }
    }

    private isUnavailable(error: any): boolean {
        return error.response && error.response.status >= 400 && error.response.status < 500;
    }
}
