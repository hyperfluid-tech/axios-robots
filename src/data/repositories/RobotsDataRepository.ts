import robotsParser, { Robot } from 'robots-parser';
import axios from 'axios';
import { HEADER_USER_AGENT, ROBOTS_TXT_FILENAME, ALLOW_ALL_ROBOTS_TXT_CONTENT } from '../../constants';
import { RobotsUnreachableError } from '../../errors/RobotsUnreachableError';
import { IRobotsDataRepository } from '../../domain/interfaces/IRobotsDataRepository';
import { CachedRobot } from '../../domain/models/CachedRobot';
import { RobotsPluginOptions } from '../../domain/models/RobotsPluginOptions';
import { CachingPolicy } from '../../domain/models/CachingPolicy';
import { CachingStrategyFactory } from '../../domain/strategies/caching/CachingStrategyFactory';
import { CachingPolicyType } from '../../domain/models/CachingPolicyType';

export class RobotsDataRepository implements IRobotsDataRepository {
    private cache: Map<string, CachedRobot> = new Map();
    private cachingPolicy: CachingPolicy;
    private strategyFactory: CachingStrategyFactory;

    constructor(options?: RobotsPluginOptions) {
        this.cachingPolicy = options?.cachingPolicy ?? { type: CachingPolicyType.Indefinite };
        this.strategyFactory = new CachingStrategyFactory();
    }

    async getRobot(url: string, userAgent: string = '*'): Promise<CachedRobot> {
        const origin = new URL(url).origin;
        let cached = this.cache.get(origin);

        const strategy = this.strategyFactory.getStrategy(this.cachingPolicy);
        const isValid = cached && strategy.isValid(cached);

        if (cached && isValid) {
            return cached;
        }

        const robot = await this.fetchRobotsTxt(origin, userAgent);
        const previousLastCrawled = cached?.lastCrawled;

        cached = {
            robot,
            fetchedAt: Date.now(),
            usageCount: 0
        };

        if (previousLastCrawled) {
            cached.lastCrawled = previousLastCrawled;
        }

        this.cache.set(origin, cached);

        return cached;
    }

    getCachedRobot(url: string): CachedRobot | undefined {
        const origin = new URL(url).origin;
        return this.cache.get(origin);
    }

    incrementUsage(url: string): void {
        const origin = new URL(url).origin;
        const cached = this.cache.get(origin);
        if (!cached) {
            return;
        }
        cached.usageCount = (cached.usageCount || 0) + 1;
    }

    setLastCrawled(url: string, timestamp: number): void {
        const origin = new URL(url).origin;
        const cached = this.cache.get(origin);
        if (!cached) {
            return;
        }
        cached.lastCrawled = timestamp;
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
