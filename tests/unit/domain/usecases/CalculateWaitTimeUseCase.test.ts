import { CalculateWaitTimeUseCase } from '../../../../src/domain/usecases/CalculateWaitTimeUseCase';
import { IRobotsDataRepository } from '../../../../src/domain/interfaces/IRobotsDataRepository';
import { CachedRobot } from '../../../../src/domain/models/CachedRobot';

describe('CalculateWaitTimeUseCase', () => {
    let useCase: CalculateWaitTimeUseCase;
    let mockDataRepository: jest.Mocked<IRobotsDataRepository>;

    beforeEach(() => {
        mockDataRepository = {
            getRobot: jest.fn(),
            setLastCrawled: jest.fn(),
        };
        useCase = new CalculateWaitTimeUseCase(mockDataRepository);
    });

    test(`
GIVEN no robot data
WHEN calculating wait time
THEN it should return 0 wait time
    `, async () => {
        mockDataRepository.getRobot.mockResolvedValue(null as any);

        const result = await useCase.execute('https://example.com', '*');

        expect(result).toEqual({ waitTime: 0, delay: 0 });
    });

    test(`
GIVEN robot data with no crawl delay
WHEN calculating wait time
THEN it should return 0 wait time
    `, async () => {
        const mockRobot = {
            getCrawlDelay: jest.fn().mockReturnValue(undefined)
        };
        mockDataRepository.getRobot.mockResolvedValue({ robot: mockRobot } as unknown as CachedRobot);

        const result = await useCase.execute('https://example.com', '*');

        expect(result).toEqual({ waitTime: 0, delay: 0 });
    });

    test(`
GIVEN robot data with crawl delay but never crawled before
WHEN calculating wait time
THEN it should return 0 wait time
    `, async () => {
        const mockRobot = {
            getCrawlDelay: jest.fn().mockReturnValue(5)
        };
        mockDataRepository.getRobot.mockResolvedValue({ 
            robot: mockRobot,
            lastCrawled: undefined
        } as unknown as CachedRobot);

        const result = await useCase.execute('https://example.com', '*');

        expect(result).toEqual({ waitTime: 0, delay: 0 });
    });

    test(`
GIVEN robot data with crawl delay and previously crawled recently
WHEN calculating wait time
THEN it should return the remaining wait time
    `, async () => {
        const delaySeconds = 2;
        const mockRobot = {
            getCrawlDelay: jest.fn().mockReturnValue(delaySeconds)
        };
        
        // Crawled 1000ms ago, delay is 2000ms, should wait 1000ms
        const now = Date.now();
        const lastCrawled = now - 1000;
        
        jest.spyOn(Date, 'now').mockReturnValue(now);

        mockDataRepository.getRobot.mockResolvedValue({ 
            robot: mockRobot,
            lastCrawled: lastCrawled
        } as unknown as CachedRobot);

        const result = await useCase.execute('https://example.com', '*');

        expect(result.waitTime).toBe(1000);
        expect(result.delay).toBe(delaySeconds);
    });

    test(`
GIVEN robot data with crawl delay and previously crawled long ago
WHEN calculating wait time
THEN it should return 0 wait time
    `, async () => {
        const delaySeconds = 2;
        const mockRobot = {
            getCrawlDelay: jest.fn().mockReturnValue(delaySeconds)
        };
        
        // Crawled 3000ms ago, delay is 2000ms, should wait 0ms
        const now = Date.now();
        const lastCrawled = now - 3000;
        
        jest.spyOn(Date, 'now').mockReturnValue(now);

        mockDataRepository.getRobot.mockResolvedValue({ 
            robot: mockRobot,
            lastCrawled: lastCrawled
        } as unknown as CachedRobot);

        const result = await useCase.execute('https://example.com', '*');

        expect(result.waitTime).toBe(0);
        expect(result.delay).toBe(delaySeconds);
    });
});
