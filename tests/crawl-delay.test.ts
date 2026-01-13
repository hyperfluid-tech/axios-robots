import axios from 'axios';
import nock from 'nock';
import { applyRobotsInterceptor } from '../src/index';

describe('Crawl-delay Compliance', () => {
    let client: ReturnType<typeof axios.create>;
    const USER_AGENT = 'CrawlBot/1.0';
    const DOMAIN = 'https://crawl-delay.com';

    beforeEach(() => {
        nock.cleanAll();
        client = axios.create();
        jest.useFakeTimers({
            doNotFake: ['nextTick', 'setImmediate']
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test.each([
        [1, 1000],
        [2, 2000],
        [3, 3000]
    ])('GIVEN a robots.txt with Crawl-delay: %i WHEN making consecutive requests THEN the second request should wait at least %i ms', async (delaySeconds, expectedDelayMs) => {
        applyRobotsInterceptor(client, { userAgent: USER_AGENT, complyWithCrawlDelay: true });

        nock(DOMAIN)
            .get('/robots.txt')
            .reply(200, `
                User-agent: *
                Crawl-delay: ${delaySeconds}
                Allow: /
            `);

        nock(DOMAIN).get('/one').reply(200, 'One');
        nock(DOMAIN).get('/two').reply(200, 'Two');

        await client.get(`${DOMAIN}/one`);
        const afterFirst = Date.now();

        const requestPromise = client.get(`${DOMAIN}/two`);
        
        jest.advanceTimersByTime(expectedDelayMs);
        
        await requestPromise;
        const end = Date.now();

        const duration = end - afterFirst;
        expect(duration).toBeGreaterThanOrEqual(expectedDelayMs);
    });

    test('GIVEN a request fails WHEN making a subsequent request THEN it should still respect the Crawl-delay', async () => {
        applyRobotsInterceptor(client, { userAgent: USER_AGENT, complyWithCrawlDelay: true });

        nock(DOMAIN)
            .get('/robots.txt')
            .reply(200, `
                User-agent: *
                Crawl-delay: 2
                Allow: /
            `);

        nock(DOMAIN).get('/fail').reply(500, 'Server Error');
        nock(DOMAIN).get('/success').reply(200, 'Success');

        try {
            await client.get(`${DOMAIN}/fail`);
        } catch (e) {
        }
        const afterFail = Date.now();

        const requestPromise = client.get(`${DOMAIN}/success`);
        
        jest.advanceTimersByTime(2000);
        
        await requestPromise;
        const end = Date.now();

        const duration = end - afterFail;
        expect(duration).toBeGreaterThanOrEqual(2000);
    });

    test('GIVEN complyWithCrawlDelay is false WHEN making consecutive requests THEN the second request should NOT wait', async () => {
        applyRobotsInterceptor(client, { userAgent: USER_AGENT, complyWithCrawlDelay: false });

        nock(DOMAIN)
            .get('/robots.txt')
            .reply(200, `
                User-agent: *
                Crawl-delay: 5
                Allow: /
            `);

        nock(DOMAIN).get('/one').reply(200, 'One');
        nock(DOMAIN).get('/two').reply(200, 'Two');

        const start = Date.now();
        await client.get(`${DOMAIN}/one`);
        await client.get(`${DOMAIN}/two`);
        const end = Date.now();

        const duration = end - start;
        expect(duration).toBeLessThan(1000); 
    });
});
