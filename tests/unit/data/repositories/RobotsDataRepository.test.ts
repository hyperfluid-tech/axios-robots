import { RobotsDataRepository } from '../../../../src/data/repositories/RobotsDataRepository';
import { RobotsPluginOptions } from '../../../../src/domain/models/RobotsPluginOptions';
import { CachingPolicyType } from '../../../../src/domain/models/CachingPolicyType';
import axios from 'axios';
import robotsParser from 'robots-parser';

jest.mock('axios');
jest.mock('robots-parser');

const mockAxios = axios as unknown as jest.Mocked<typeof axios>;
const mockRobotsParser = robotsParser as unknown as jest.MockedFunction<typeof robotsParser>;

describe('RobotsDataRepository', () => {
    let repository: RobotsDataRepository;
    const origin = 'https://example.com';
    const userAgent = 'test-bot';

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
    });

    describe('Caching Behavior', () => {
        test(`
        GIVEN an indefinite (default) caching policy
        WHEN robots.txt is requested twice with a long time gap
        THEN it should only fetch from the network once
        `, async () => {
            repository = new RobotsDataRepository({ userAgent } as RobotsPluginOptions);
            const future = Date.now() + 100 * 24 * 60 * 60 * 1000;

            await repository.getRobot(origin, userAgent);
            jest.spyOn(Date, 'now').mockReturnValue(future);
            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(1);
        });

        test(`
        GIVEN an expireAfter caching policy
        WHEN robots.txt is requested after the expiration duration
        THEN it should fetch from the network again
        `, async () => {
            const duration = '5m';
            const durationMs = 5 * 60 * 1000;
            repository = new RobotsDataRepository({
                userAgent,
                cachingPolicy: {
                    type: CachingPolicyType.ExpireAfter,
                    duration
                }
            } as RobotsPluginOptions);
            const initialTime = 1000;
            const expiredTime = initialTime + durationMs + 1;
            jest.spyOn(Date, 'now').mockReturnValue(initialTime);

            await repository.getRobot(origin, userAgent);
            jest.spyOn(Date, 'now').mockReturnValue(expiredTime);
            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(2);
        });

        test(`
        GIVEN an expireAfter caching policy
        WHEN robots.txt is requested before the expiration duration
        THEN it should return the cached data without refetching
        `, async () => {
            const duration = 5 * 60 * 1000;
            const durationMs = duration;
            repository = new RobotsDataRepository({
                userAgent,
                cachingPolicy: {
                    type: CachingPolicyType.ExpireAfter,
                    duration
                }
            } as RobotsPluginOptions);
            const initialTime = 1000;
            const validTime = initialTime + durationMs - 1;
            jest.spyOn(Date, 'now').mockReturnValue(initialTime);

            await repository.getRobot(origin, userAgent);
            jest.spyOn(Date, 'now').mockReturnValue(validTime);
            await repository.getRobot(origin, userAgent);

            expect(mockAxios.create).toHaveBeenCalledTimes(1);
        });
    });
});
