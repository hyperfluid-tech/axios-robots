import { RobotsError, ERROR_MESSAGES } from '../../../src/errors';

describe('RobotsError', () => {
    test(`
    GIVEN no message provided
    WHEN initialized
    THEN it should use the default error message
    `, () => {
        const error = new RobotsError();
        expect(error.message).toBe(ERROR_MESSAGES.DEFAULT_BLOCK);
        expect(error.name).toBe('RobotsError');
    });

    test(`
    GIVEN a custom message
    WHEN initialized
    THEN it should use the provided message
    `, () => {
        const customMessage = 'Custom error';
        const error = new RobotsError(customMessage);
        expect(error.message).toBe(customMessage);
        expect(error.name).toBe('RobotsError');
    });
});
