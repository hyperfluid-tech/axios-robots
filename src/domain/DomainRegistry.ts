import robotsParser, { Robot } from 'robots-parser';
import axios from 'axios';
import { HEADER_USER_AGENT, ROBOTS_TXT_FILENAME, ALLOW_ALL_ROBOTS_TXT_CONTENT } from '../constants';

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

    // robots-parser's isAllowed returns boolean | undefined. Undefined usually means no rule, so allow.
    // However, the library signatures says it returns boolean usually.
    // We strictly check for explicitly disallowed.
    return robot.isAllowed(url, userAgent) ?? true;
  }

  private async fetchRobotsTxt(origin: string, userAgent: string): Promise<Robot> {
    const robotsUrl = `${origin}/${ROBOTS_TXT_FILENAME}`;
    // Use a fresh axios instance to avoid triggering our own interceptor recursively
    // if the user attached it to the global axios instance.
    const internalClient = axios.create({
      headers: {
        [HEADER_USER_AGENT]: userAgent,
      }
    });
    try {
      const response = await internalClient.get(robotsUrl);
      return robotsParser(robotsUrl, response.data);
    } catch (error: any) {
        // Per RFC 9309 2.3.1.3: "Unavailable" Status (400-499)
        // "If a server status code indicates that the robots.txt file is unavailable... 
        // then the crawler MAY access any resources on the server."
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
        // Create a robot that allows everything
        return robotsParser(robotsUrl, ALLOW_ALL_ROBOTS_TXT_CONTENT);
      }
      
      // For other errors (500, network, etc), we rethrow to prevent access
      // as we cannot determine if we are allowed or not.
      throw error;
    }
  }
}
