import { IAllowService } from '../interfaces/IAllowService';
import { IRobotsDataService } from '../interfaces/IRobotsDataService';

export class AllowService implements IAllowService {
    constructor(private dataService: IRobotsDataService) { }

    /**
     * Checks if the given URL is allowed for the specified User-Agent.
     * Fetching and caching the robots.txt is handled automatically by the data service.
     */
    async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
        const robot = await this.dataService.getRobot(url, userAgent);

        if (!robot || !robot.robot) {
            return true;
        }

        return robot.robot.isAllowed(url, userAgent) ?? true;
    }
}
