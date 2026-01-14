import { AllowService } from '../../../../src/domain/services/AllowService';
import { IRobotsDataRepository } from '../../../../src/domain/interfaces/IRobotsDataRepository';
import { CachedRobot } from '../../../../src/domain/models/CachedRobot';

describe('AllowService', () => {
    let service: AllowService;
    let mockDataRepository: jest.Mocked<IRobotsDataRepository>;

    beforeEach(() => {
        mockDataRepository = {
            getRobot: jest.fn(),
            setLastCrawled: jest.fn(),
        };
        service = new AllowService(mockDataRepository);
    });

    test(`
GIVEN no robot data is found
WHEN checking if a URL is allowed
THEN it should return true (default allow)
    `, async () => {
        mockDataRepository.getRobot.mockResolvedValue(null as any);

        const result = await service.isAllowed('https://example.com/foo');

        expect(result).toBe(true);
    });

    test(`
GIVEN robot data exists but has no robot object
WHEN checking if a URL is allowed
THEN it should return true
    `, async () => {
        mockDataRepository.getRobot.mockResolvedValue({ robot: null } as unknown as CachedRobot);

        const result = await service.isAllowed('https://example.com/foo');

        expect(result).toBe(true);
    });

    test(`
GIVEN robot rules exist and allow the URL
WHEN checking if a URL is allowed
THEN it should return true
    `, async () => {
        const mockRobot = {
            isAllowed: jest.fn().mockReturnValue(true)
        };
        mockDataRepository.getRobot.mockResolvedValue({ robot: mockRobot } as unknown as CachedRobot);

        const result = await service.isAllowed('https://example.com/foo');

        expect(result).toBe(true);
        expect(mockRobot.isAllowed).toHaveBeenCalledWith('https://example.com/foo', '*');
    });

    test(`
GIVEN robot rules exist and disallow the URL
WHEN checking if a URL is allowed
THEN it should return false
    `, async () => {
        const mockRobot = {
            isAllowed: jest.fn().mockReturnValue(false)
        };
        mockDataRepository.getRobot.mockResolvedValue({ robot: mockRobot } as unknown as CachedRobot);

        const result = await service.isAllowed('https://example.com/private');

        expect(result).toBe(false);
    });

    test(`
GIVEN robot rules exist but isAllowed returns undefined
WHEN checking if a URL is allowed
THEN it should return true (default to allowed)
    `, async () => {
        const mockRobot = {
            isAllowed: jest.fn().mockReturnValue(undefined)
        };
        mockDataRepository.getRobot.mockResolvedValue({ robot: mockRobot } as unknown as CachedRobot);

        const result = await service.isAllowed('https://example.com/foo');

        expect(result).toBe(true);
    });
});
