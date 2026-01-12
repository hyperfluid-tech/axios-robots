export const ERROR_MESSAGES = {
  INVALID_URL: (details: string) => `Invalid URL: ${details}`,
  INVALID_PROTOCOL: (protocol: string) => `Invalid protocol: ${protocol}. Only HTTP/S is supported for robots.txt compliance.`,
  ROBOTS_DENIED: (url: string, userAgent: string) => `URL ${url} is assumed to be disallowed by robots.txt for User-Agent ${userAgent}`,
  DEFAULT_BLOCK: 'Request blocked by robots.txt',
};
