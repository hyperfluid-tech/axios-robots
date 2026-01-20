import { RobotsDataRepository } from '../../../../src/data/repositories/RobotsDataRepository';
import { RobotsPluginOptions } from '../../../../src/domain/models/RobotsPluginOptions';
import { CachingStrategyFactory } from '../../../../src/domain/strategies/caching/CachingStrategyFactory';
import axios from 'axios';
import robotsParser from 'robots-parser';
import { HEADER_USER_AGENT } from '../../../../src/constants';

jest.mock('axios');
jest.mock('robots-parser');
jest.mock('../../../../src/domain/strategies/caching/CachingStrategyFactory');

const mockAxios = axios as unknown as jest.Mocked<typeof axios>;
const mockRobotsParser = robotsParser as unknown as jest.MockedFunction<typeof robotsParser>;
const mockStrategyFactory = CachingStrategyFactory as unknown as jest.MockedClass<typeof CachingStrategyFactory>;

describe('RobotsDataRepository', () => {
    let repository: RobotsDataRepository;
    const origin = 'https://example.com';
    const userAgent = 'test-bot';
    let mockStrategy: { isValid: jest.Mock; };

    beforeEach(() => {
        jest.clearAllMocks();

        mockAxios.create.mockReturnValue({
            get: jest.fn().mockResolvedValue({ data: 'User-agent: *\nDisallow: /' })
        } as any);

        mockRobotsParser.mockReturnValue({
            isAllowed: jest.fn(),
            isDisallowed: jest.fn(),
            getMatchingLineNumber: jest.fn(),
            getCrawlDelay: jest.fn(),
            getSitemaps: jest.fn(),
            getPreferredHost: jest.fn(),
        });

        mockStrategy = { isValid: jest.fn() };
        mockStrategyFactory.prototype.getStrategy = jest.fn().mockReturnValue(mockStrategy);
    });

    describe('Caching Behavior', () => {
        test(`
        GIVEN strategy says cache is valid
        WHEN robots.txt is requested
        THEN it should NOT fetch from network
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);
            await repository.getRobot(origin, userAgent);

            mockStrategy.isValid.mockReturnValue(true);

            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(1);
            expect(mockStrategy.isValid).toHaveBeenCalled();
        });

        test(`
        GIVEN strategy says cache is invalid
        WHEN robots.txt is requested
        THEN it should fetch from network again
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);
            await repository.getRobot(origin, userAgent);

            mockStrategy.isValid.mockReturnValue(false);

            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(2);
            expect(mockStrategy.isValid).toHaveBeenCalled();
        });

        test(`
        GIVEN valid cached robot
        WHEN incrementUsage is called
        THEN usageCount should be incremented
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            const cached1 = await repository.getRobot(origin, userAgent);
            expect(cached1.usageCount).toBe(0);

            repository.incrementUsage(origin);
            expect(cached1.usageCount).toBe(1);

            mockStrategy.isValid.mockReturnValue(true);

            const cached2 = await repository.getRobot(origin, userAgent);
            expect(cached2).toBe(cached1);
            expect(cached2.usageCount).toBe(1);

            repository.incrementUsage(origin);
            expect(cached2.usageCount).toBe(2);
        });

        test(`
        GIVEN cached robot updates
        WHEN cached robot is refreshed
        THEN usageCount should reset to 0
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            const cached1 = await repository.getRobot(origin, userAgent);
            repository.incrementUsage(origin);
            expect(cached1.usageCount).toBe(1);

            mockStrategy.isValid.mockReturnValue(false);

            const cached2 = await repository.getRobot(origin, userAgent);

            expect(cached2).not.toBe(cached1);
            expect(cached2.usageCount).toBe(0);
        });

        test(`
        GIVEN cached robot exists
        WHEN getCachedRobot is called
        THEN it should return the cached robot without validation
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            const cached1 = await repository.getRobot(origin, userAgent);

            mockStrategy.isValid.mockReturnValue(false);

            const result = repository.getCachedRobot(origin);

            expect(result).toBe(cached1);
            expect(mockStrategy.isValid).not.toHaveBeenCalled();
        });

        test(`
        GIVEN no cached robot
        WHEN incrementUsage is called
        THEN it should do nothing
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            repository.incrementUsage('https://unknown.com');

            expect(repository.getCachedRobot('https://unknown.com')).toBeUndefined();
        });

        test(`
        GIVEN no cached robot
        WHEN setLastCrawled is called
        THEN it should do nothing
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            repository.setLastCrawled('https://unknown.com', Date.now());

            expect(repository.getCachedRobot('https://unknown.com')).toBeUndefined();
        });

        test(`
        GIVEN no userAgent provided
        WHEN getRobot is called
        THEN it should default to wildchar
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            await repository.getRobot(origin);

            expect(mockAxios.create).toHaveBeenCalledWith(expect.objectContaining({
                headers: expect.objectContaining({
                    [HEADER_USER_AGENT]: '*'
                })
            }));
        });
    });
});
