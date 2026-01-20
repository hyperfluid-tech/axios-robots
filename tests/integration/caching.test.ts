import axios from 'axios';
import nock from 'nock';
import { applyRobotsInterceptor } from '../../src/index';
import { CachingPolicyType } from '../../src/domain/models/CachingPolicyType';

describe('Caching Policy Integration', () => {
    let client: ReturnType<typeof axios.create>;
    const USER_AGENT = 'TestBot/1.0';
    const DOMAIN = 'https://example.com';

    beforeEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test(`
    GIVEN an indefinite caching policy (default)
    WHEN multiple requests are made over a long period
    THEN robots.txt should only be fetched once
    `, async () => {
        const initialTime = 1672531200000; // 2023-01-01
        jest.spyOn(Date, 'now').mockReturnValue(initialTime);

        client = axios.create();
        applyRobotsInterceptor(client, { userAgent: USER_AGENT });

        const robotsScope = nock(DOMAIN)
            .get('/robots.txt')
            .times(1)
            .reply(200, `User-agent: *\nAllow: /`);

        nock(DOMAIN).get('/first').reply(200, 'OK');
        nock(DOMAIN).get('/second').reply(200, 'OK');

        await client.get(`${DOMAIN}/first`);

        jest.spyOn(Date, 'now').mockReturnValue(initialTime + 1000 * 60 * 60 * 24 * 100);

        await client.get(`${DOMAIN}/second`);

        expect(robotsScope.isDone()).toBe(true);
    });

    test(`
    GIVEN an expireAfter caching policy of 5 minutes
    WHEN a second request is made after 6 minutes
    THEN robots.txt should be fetched again
    `, async () => {
        const initialTime = 1672531200000;
        jest.spyOn(Date, 'now').mockReturnValue(initialTime);

        client = axios.create();
        applyRobotsInterceptor(client, { 
            userAgent: USER_AGENT,
            cachingPolicy: {
                type: CachingPolicyType.ExpireAfter,
                duration: '5m'
            }
        });

        const robotsScope = nock(DOMAIN)
            .get('/robots.txt')
            .times(2)
            .reply(200, `User-agent: *\nAllow: /`);

        nock(DOMAIN).get('/first').reply(200, 'OK');
        nock(DOMAIN).get('/second').reply(200, 'OK');

        await client.get(`${DOMAIN}/first`);

        jest.spyOn(Date, 'now').mockReturnValue(initialTime + 1000 * 60 * 6);

        await client.get(`${DOMAIN}/second`);

        expect(robotsScope.isDone()).toBe(true);
    });

    test(`
    GIVEN an expireAfter caching policy of 5 minutes
    WHEN a second request is made within 4 minutes
    THEN robots.txt should NOT be fetched again
    `, async () => {
        const initialTime = 1672531200000;
        jest.spyOn(Date, 'now').mockReturnValue(initialTime);

        client = axios.create();
        applyRobotsInterceptor(client, { 
            userAgent: USER_AGENT,
            cachingPolicy: {
                type: CachingPolicyType.ExpireAfter,
                duration: '5m'
            }
        });

        const robotsScope = nock(DOMAIN)
            .get('/robots.txt')
            .times(1)
            .reply(200, `User-agent: *\nAllow: /`);

        nock(DOMAIN).get('/first').reply(200, 'OK');
        nock(DOMAIN).get('/second').reply(200, 'OK');

        await client.get(`${DOMAIN}/first`);

        jest.spyOn(Date, 'now').mockReturnValue(initialTime + 1000 * 60 * 4);

        await client.get(`${DOMAIN}/second`);

        expect(robotsScope.isDone()).toBe(true);
    });
    test(`
    GIVEN a requestCount caching policy of 2 requests
    WHEN a third request is made
    THEN robots.txt should be fetched again
    `, async () => {
        const initialTime = 1672531200000;
        jest.spyOn(Date, 'now').mockReturnValue(initialTime);

        client = axios.create();
        applyRobotsInterceptor(client, {
            userAgent: USER_AGENT,
            cachingPolicy: {
                type: CachingPolicyType.RequestCount,
                maxRequests: 2
            }
        });

        const robotsScope = nock(DOMAIN)
            .get('/robots.txt')
            .times(2)
            .reply(200, `User-agent: *\nAllow: /`);

        nock(DOMAIN).get('/first').reply(200, 'OK');
        nock(DOMAIN).get('/second').reply(200, 'OK');
        nock(DOMAIN).get('/third').reply(200, 'OK');

        await client.get(`${DOMAIN}/first`);
        await client.get(`${DOMAIN}/second`);
        await client.get(`${DOMAIN}/third`);

        expect(robotsScope.isDone()).toBe(true);
    });

    test(`
    GIVEN a requestCount caching policy of 2 requests
    WHEN a second request is made
    THEN robots.txt should NOT be fetched again
    `, async () => {
        const initialTime = 1672531200000;
        jest.spyOn(Date, 'now').mockReturnValue(initialTime);

        client = axios.create();
        applyRobotsInterceptor(client, {
            userAgent: USER_AGENT,
            cachingPolicy: {
                type: CachingPolicyType.RequestCount,
                maxRequests: 2
            }
        });

        const robotsScope = nock(DOMAIN)
            .get('/robots.txt')
            .times(1)
            .reply(200, `User-agent: *\nAllow: /`);

        nock(DOMAIN).get('/first').reply(200, 'OK');
        nock(DOMAIN).get('/second').reply(200, 'OK');

        await client.get(`${DOMAIN}/first`);
        await client.get(`${DOMAIN}/second`);

        expect(robotsScope.isDone()).toBe(true);
    });
});
