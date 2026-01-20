# Axios Robots Exclusion Protocol 🤖

[![npm version](https://img.shields.io/npm/v/axios-robots.svg)](https://www.npmjs.com/package/axios-robots)
![Coverage](https://raw.githubusercontent.com/hyperfluid-tech/axios-robots/refs/heads/badges/badges/coverage.svg)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%23007ACC.svg)](https://www.typescriptlang.org/)

A lightweight, robust **Axios request interceptor** that automatically enforces the strict **Robots Exclusion Protocol (robots.txt)** for your web scrapers and bots.

Ensures your bot plays by the rules defined by website owners, preventing unauthorized access and potential bans.

## Features

- **🚀 Automated Compliance**: Validates every request against `robots.txt` rules (cached per origin).
- **⏱️ Crawl-Delay**: Option to automatically wait before requests if `Crawl-delay` is specified.
- **🛡️ Strict Mode**: invalid URLs, non-HTTP/S protocols, or unreachable `robots.txt` files (non-4xx error) block requests by default.
- **✨ Clean Architecture**: built with maintainability and separation of concerns in mind.
- **🔌 Plug-and-Play**: easily attaches to any Axios instance.
- **📦 Lightweight**: minimal dependencies (`robots-parser`).

## Installation

```bash
npm install axios-robots
# or
yarn add axios-robots
# or
pnpm add axios-robots
# or
bun add axios-robots
```

## Usage

### Basic Setup

Import the `applyRobotsInterceptor` function and attach it to your Axios instance. You **must** provide a `userAgent` that identifies your bot.

```typescript
import axios from 'axios';
import { applyRobotsInterceptor } from 'axios-robots';

const client = axios.create();

// Apply the interceptor
applyRobotsInterceptor(client, { 
    userAgent: 'MyCoolBot/1.0',
});

async function crawl() {
  try {
    // 1. Valid request (if allowed by robots.txt)
    const response = await client.get('https://www.google.com/');
    console.log('Data:', response.data);

    // 2. Blocked request (e.g. Google disallows /search)
    await client.get('https://www.google.com/search?q=axios-robots');

  } catch (error: any) {
    if (error.name === 'RobotsError') {
      console.error('⛔ Access denied by robots.txt:', error.message);
    } else {
      console.error('Network or other error:', error);
    }
  }
}

crawl();
```

## API Reference

### `applyRobotsInterceptor(axiosInstance, options)`

Attaches the interceptor to the provided Axios instance.

- **axiosInstance**: `AxiosInstance` - The instance to modify.
- **options**: `RobotsPluginOptions` - Configuration object.

### `RobotsPluginOptions`

```typescript
interface RobotsPluginOptions {
  userAgent: string;
  crawlDelayCompliance?: CrawlDelayComplianceMode; // default: CrawlDelayComplianceMode.Await
  cachingPolicy?: CachingPolicy; // default: Indefinite (caches forever)
}

enum CrawlDelayComplianceMode {
  Await = 'await',   // Respects delay by waiting
  Ignore = 'ignore', // Ignores delay
  Failure = 'failure' // Throws Error if delay is not met
}
```

### `CachingPolicy`

You can configure how long `robots.txt` is cached.

```typescript
import { CachingPolicyType } from 'axios-robots';

// Option 1: Indefinite Caching (Default)
const indefinite = {
    type: CachingPolicyType.Indefinite
};

// Option 2: Time-based Expiration
const timeBased = {
    type: CachingPolicyType.ExpireAfter,
    duration: '1h' // Supports strings ('5m', '1d', '200ms') or numbers (milliseconds)
};

// Option 3: Request-based Expiration
const requestBased = {
    type: CachingPolicyType.RequestCount,
    maxRequests: 10 // Expire after 10 requests
};
```

### Error Handling

The interceptor throws a `RobotsError` in the following cases:

1. **Blocked by Rules**: The URL is disallowed by `robots.txt` for your User-Agent.
2. **Invalid URL**: The request URL cannot be parsed.
3. **Invalid Protocol**: The protocol is not `http:` or `https:`.
4. **Unreachable robots.txt**: The `robots.txt` file could not be fetched (and did not return a 4xx status).

**Note**: If `robots.txt` returns a **Client Error (4xx)** (e.g. 404 Not Found, 403 Forbidden), the library assumes **Allow All** (per RFC 9309).

## How It Works

1. **Interception**: Intercepts every HTTP/S request made by the Axios instance.
2. **Fetch**: Automatically fetches the `robots.txt` from the request's origin (e.g., `https://example.com/robots.txt`) using your configured User-Agent.
3. **Cache**: Caches the parsed `robots.txt` rules in memory to prevent redundant requests.
4. **Validate**: Checks if the target URL is allowed.
5. **Proceed or Block**:
   - If **Allowed**: The request proceeds normally.
   - If **Disallowed** (or error): The request is cancelled immediately with a `RobotsError`.

## Compliance & Roadmap

### ✅ Implemented
- [x] **[RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) Compliance**: Full support for the standard Robots Exclusion Protocol.
- [x] **Standard Directives**: Supports `User-agent`, `Allow`, and `Disallow`.
- [x] **Wildcards**: Supports standard path matching including `*` and `$`.
- [x] **Crawl-delay**: The interceptor enforces `Crawl-delay` directives (automatic throttling) if configured.
- [x] **Cache TTL**: Flexible caching policies (indefinite or expiration-based).

### 🚧 Roadmap
- [ ] **Sitemap**: Does not currently expose or parse `Sitemap` directives for the consumer.

## Contributing

We love contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

If you're looking for a place to start, check out the [Roadmap](#-roadmap).

## License

BSD 3-Clause
