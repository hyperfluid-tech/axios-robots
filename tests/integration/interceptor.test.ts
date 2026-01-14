import axios from 'axios';
import nock from 'nock';
import { applyRobotsInterceptor } from '../../src/index';
import { RobotsError } from '../../src/errors/RobotsError';
import { HEADER_USER_AGENT } from '../../src/constants';

describe('Axios Robots Interceptor', () => {
    let client: ReturnType<typeof axios.create>;
    const USER_AGENT = 'TestBot/1.0';
    const DOMAIN = 'https://example.com';

    beforeEach(() => {
        nock.cleanAll();
        client = axios.create();
        applyRobotsInterceptor(client, { userAgent: USER_AGENT });
    });

    describe('RFC Compliance: Access Rules', () => {
        test(`
GIVEN a robots.txt with a specific Disallow rule
WHEN the bot requests a matching path
THEN it should throw a RobotsError
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(200, `User-agent: *\nDisallow: /private`);

            nock(DOMAIN)
                .get('/private')
                .reply(200, 'Secret Data');

            await expect(client.get(`${DOMAIN}/private`)).rejects.toThrow(RobotsError);
        });

        test(`
GIVEN a robots.txt with a specific Allow rule
WHEN the bot requests a matching path
THEN it should allow the request
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(200, `User-agent: *\nAllow: /public`);

            nock(DOMAIN)
                .get('/public')
                .reply(200, 'Public Data');

            const response = await client.get(`${DOMAIN}/public`);

            expect(response.status).toBe(200);
            expect(response.data).toBe('Public Data');
        });

        test(`
GIVEN a robots.txt with a wildcard Disallow rule
WHEN the bot requests a matching file
THEN it should throw a RobotsError
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(200, `User-agent: *\nDisallow: /*.gif$`);

            await expect(client.get(`${DOMAIN}/image.gif`)).rejects.toThrow(RobotsError);
        });
    });

    describe('RFC Compliance: User-Agent Matching', () => {
        test(`
GIVEN a robots.txt with specific rules for TestBot
WHEN TestBot requests a URL
THEN it should follow the specific rules
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(200, `
                    User-agent: *\nDisallow: /
                    User-agent: ${USER_AGENT}\nAllow: /specific
                `);

            nock(DOMAIN)
                .get('/specific')
                .reply(200, 'Allowed Data');

            const response = await client.get(`${DOMAIN}/specific`);

            expect(response.status).toBe(200);
        });
    });

    describe('RFC Compliance: Status Codes (Availability)', () => {
        test(`
GIVEN the robots.txt endpoint returns 404 (Not Found)
WHEN a request is made
THEN it should allow access
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(404);

            nock(DOMAIN)
                .get('/anything')
                .reply(200, 'OK');

            const response = await client.get(`${DOMAIN}/anything`);

            expect(response.status).toBe(200);
        });

        test(`
GIVEN the robots.txt endpoint returns 403 (Forbidden)
WHEN a request is made
THEN it should allow access (Unavailable = Allow)
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(403);

            nock(DOMAIN)
                .get('/anything')
                .reply(200, 'OK');

            const response = await client.get(`${DOMAIN}/anything`);

            expect(response.status).toBe(200);
        });

        test(`
GIVEN the robots.txt endpoint returns 500 (Internal Server Error)
WHEN a request is made
THEN it should throw a RobotsError (Unreachable = Disallow)
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .reply(500);

            await expect(client.get(`${DOMAIN}/anything`)).rejects.toThrow(RobotsError);
        });
    });

    describe('Interceptor Logic & Safety', () => {
        test(`
GIVEN an invalid URL
WHEN a request is made
THEN it should throw a RobotsError
        `, async () => {

            await expect(client.get('not-a-url')).rejects.toThrow(/Invalid URL/);
        });

        test(`
GIVEN a non-HTTP protocol
WHEN a request is made
THEN it should throw a RobotsError
        `, async () => {

            await expect(client.get('ftp://example.com/file')).rejects.toThrow(/Invalid protocol/);
        });

        test(`
GIVEN a valid config
WHEN fetching robots.txt
THEN it should send the configured User-Agent header
        `, async () => {

            nock(DOMAIN)
                .get('/robots.txt')
                .matchHeader(HEADER_USER_AGENT, USER_AGENT)
                .reply(200, `User-agent: *\nAllow: /`);

            nock(DOMAIN)
                .get('/')
                .reply(200, 'OK');

            const response = await client.get(`${DOMAIN}/`);

            expect(response.status).toBe(200);
        });
    });

    describe('Caching', () => {
        test(`
GIVEN a cached robots.txt
WHEN making a second request to the same origin
THEN it should not make a second network request for robots.txt
        `, async () => {

            const scope = nock(DOMAIN)
                .get('/robots.txt')
                .reply(200, `User-agent: *\nAllow: /`);

            nock(DOMAIN)
                .get('/one')
                .reply(200, 'OK');

            nock(DOMAIN)
                .get('/two')
                .reply(200, 'OK');

            await client.get(`${DOMAIN}/one`);
            await client.get(`${DOMAIN}/two`);

            expect(scope.isDone()).toBe(true);
        });
    });
});
