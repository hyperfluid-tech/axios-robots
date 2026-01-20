import { RobotsDataRepository } from '../../../../src/data/repositories/RobotsDataRepository';
import { RobotsPluginOptions } from '../../../../src/domain/models/RobotsPluginOptions';
import { CachingStrategyFactory } from '../../../../src/domain/strategies/caching/CachingStrategyFactory';
import axios from 'axios';
import robotsParser from 'robots-parser';

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

        // Setup mock strategy
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

            // First call to populate cache
            await repository.getRobot(origin, userAgent);

            // Setup validation to return true
            mockStrategy.isValid.mockReturnValue(true);

            // Second call
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

            // First call to populate cache
            await repository.getRobot(origin, userAgent);

            // Setup validation to return false
            mockStrategy.isValid.mockReturnValue(false);

            // Second call
            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(2);
            expect(mockStrategy.isValid).toHaveBeenCalled();
        });

        test(`
        GIVEN ignoreCachePolicy option is true
        WHEN robots.txt is requested
        THEN it should NOT check strategy validity and return cached if available
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            // First call to populate cache
            await repository.getRobot(origin, userAgent);

            // Clear strategy calls to verify it's NOT called
            mockStrategy.isValid.mockClear();

            // Second call with ignoreCachePolicy
            await repository.getRobot(origin, userAgent, { ignoreCachePolicy: true });

            expect(mockAxios.create).toHaveBeenCalledTimes(1);
            expect(mockStrategy.isValid).not.toHaveBeenCalled();
        });

        test(`
        GIVEN incrementUsage is true (default)
        WHEN valid cached robot is returned
        THEN usageCount should be incremented
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

            // First call (usageCount = 1)
            await repository.getRobot(origin, userAgent);

            mockStrategy.isValid.mockReturnValue(true);

            // Second call (usageCount = 2)
            const result = await repository.getRobot(origin, userAgent);

            expect(result.usageCount).toBe(2);
        });

        test(`
        GIVEN incrementUsage is false
        WHEN valid cached robot is returned
        THEN usageCount should NOT be incremented
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);

        // First call (usageCount = 1)
            await repository.getRobot(origin, userAgent);

            mockStrategy.isValid.mockReturnValue(true);

            // Second call (usageCount should remain 1)
            const result = await repository.getRobot(origin, userAgent, { incrementUsage: false });

            expect(result.usageCount).toBe(1);
        });
    });
});
