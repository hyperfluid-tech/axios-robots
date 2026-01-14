
import { IRobotsDataService } from '../../types';

export class CalculateWaitTimeUseCase {
    constructor(private dataService: IRobotsDataService) { }

    async execute(url: string, userAgent: string): Promise<{ waitTime: number; delay: number; }> {
        const cachedRobot = await this.dataService.getRobot(url, userAgent);

        if (!cachedRobot || !cachedRobot.robot) {
            return { waitTime: 0, delay: 0 };
        }

        const delay = cachedRobot.robot.getCrawlDelay(userAgent);
        if (!delay || delay <= 0 || !cachedRobot.lastCrawled) {
            return { waitTime: 0, delay: 0 };
        }

        const timeSinceLastCrawl = Date.now() - cachedRobot.lastCrawled;
        const waitTime = (delay * 1000) - timeSinceLastCrawl;

        return {
            waitTime: waitTime > 0 ? waitTime : 0,
            delay
        };
    }
}
