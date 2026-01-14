import { IAllowService } from '../interfaces/IAllowService';
import { IRobotsDataRepository } from '../interfaces/IRobotsDataRepository';

export class AllowService implements IAllowService {
    constructor(private dataService: IRobotsDataRepository) { }

    async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
        const robot = await this.dataService.getRobot(url, userAgent);

        if (!robot || !robot.robot) {
            return true;
        }

        return robot.robot.isAllowed(url, userAgent) ?? true;
    }
}
