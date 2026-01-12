# Axios Robots Exclusion Protocol 🤖

[![npm version](https://img.shields.io/npm/v/axios-robots.svg)](https://www.npmjs.com/package/axios-robots)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%23007ACC.svg)](https://www.typescriptlang.org/)

A lightweight, robust **Axios request interceptor** that automatically enforces the strict **Robots Exclusion Protocol (robots.txt)** for your web scrapers and bots.

Ensures your bot plays by the rules defined by website owners, preventing unauthorized access and potential bans.

## Features

- **🚀 Automated Compliance**: Validates every request against `robots.txt` rules (cached per origin).
- **🛡️ Strict Mode**: invalid URLs, non-HTTP/S protocols, or unreachable `robots.txt` files (non-404) block requests by default.
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
    userAgent: 'MyCoolBot/1.0' 
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
}
```

### Error Handling

The interceptor throws a `RobotsError` in the following cases:

1. **Blocked by Rules**: The URL is disallowed by `robots.txt` for your User-Agent.
2. **Invalid URL**: The request URL cannot be parsed.
3. **Invalid Protocol**: The protocol is not `http:` or `https:`.
4. **Unreachable robots.txt**: The `robots.txt` file could not be fetched (and did not return 404).

> **Note**: If `robots.txt` returns a **404 Not Found**, the library assumes **Allow All** (per standard protocol).

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

### 🚧 Missing / TODO
- [ ] **Crawl-delay**: The interceptor currently does **not** enforce `Crawl-delay` directives (automatic throttling).
- [ ] **Sitemap**: Does not currently expose or parse `Sitemap` directives for the consumer.
- [ ] **Cache TTL**: Caching is currently indefinite for the lifecycle of the Axios instance.

## Contributing

Contributions are clear! Please follow the existing Clean Architecture pattern:
- **`domain/`**: Core logic (fetching/parsing robots.txt).
- **`errors/`**: Custom error classes and messages.
- **`interceptor.ts`**: Axios integration logic.
- **`types.ts`**: Shared interfaces.

## License

BSD 3-Clause
