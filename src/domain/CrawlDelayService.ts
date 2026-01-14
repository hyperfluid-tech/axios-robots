import { RobotsDataService } from './RobotsDataService';
import { CrawlDelayComplianceMode, ICrawlDelayService, IRobotsDataService } from '../types';
import { CrawlDelayError } from '../errors/CrawlDelayError';

export class CrawlDelayService implements ICrawlDelayService {
    constructor(private dataService: IRobotsDataService) {}

    /**
     * Handles the crawl delay for the given URL and user agent.
     * Enforces the delay based on the compliance mode.
     */
    async handleCrawlDelay(
        url: string, 
        userAgent: string, 
        complianceMode: CrawlDelayComplianceMode
    ): Promise<void> {
        if (complianceMode === CrawlDelayComplianceMode.Ignore) {
            return;
        }

        const cachedRobot = await this.dataService.getRobot(url, userAgent);

        if (!cachedRobot || !cachedRobot.robot)
            return;

        const delay = cachedRobot.robot.getCrawlDelay(userAgent);
        if (!delay || delay <= 0 || !cachedRobot.lastCrawled)
            return;

        const timeSinceLastCrawl = Date.now() - cachedRobot.lastCrawled;
        const waitTime = (delay * 1000) - timeSinceLastCrawl;
        if (waitTime <= 0)
            return;

        if (complianceMode === CrawlDelayComplianceMode.Failure) {
            throw new CrawlDelayError(delay);
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
}
