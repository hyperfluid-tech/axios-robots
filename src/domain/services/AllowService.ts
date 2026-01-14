import { IAllowService } from '../interfaces/IAllowService';
import { IRobotsDataService } from '../interfaces/IRobotsDataService';

export class AllowService implements IAllowService {
    constructor(private dataService: IRobotsDataService) { }

    async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
        const robot = await this.dataService.getRobot(url, userAgent);

        if (!robot || !robot.robot) {
            return true;
        }

        return robot.robot.isAllowed(url, userAgent) ?? true;
    }
}
