import { InternalAxiosRequestConfig } from 'axios';
import { DomainRegistry } from './domain/DomainRegistry';
import { RobotsError } from './errors/RobotsError';
import { HEADER_USER_AGENT, PROTOCOL_HTTP, PROTOCOL_HTTPS } from './constants';
import { ERROR_MESSAGES } from './errors/messages';
import { RobotsPluginOptions } from './types';

export class RobotsInterceptor {
  private registry: DomainRegistry;
  private userAgent: string;

  constructor(options: RobotsPluginOptions) {
    this.registry = new DomainRegistry();
    this.userAgent = options.userAgent;
  }

  /**
   * Axios Request Interceptor
   */
  public async intercept(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (!config.url) {
      return config;
    }

    // Resolve full URL if relative
    let fullUrlObject: URL;

    try {
      if (config.url && (config.url.startsWith(PROTOCOL_HTTP) || config.url.startsWith(PROTOCOL_HTTPS))) {
        fullUrlObject = new URL(config.url);
      } else if (config.baseURL) {
        fullUrlObject = new URL(config.url || '', config.baseURL);
      } else {
        // If no baseURL and url is not absolute http/s, try to parse it as absolute (e.g. might be just hostname)
        // or fail if relative
        fullUrlObject = new URL(config.url || '');
      }


    } catch (e: any) {
      // If we cannot parse a valid URL, we cannot enforce robots.txt
      throw new RobotsError(ERROR_MESSAGES.INVALID_URL(e.message));
    }

    if (fullUrlObject.protocol !== PROTOCOL_HTTP && fullUrlObject.protocol !== PROTOCOL_HTTPS) {
      throw new RobotsError(ERROR_MESSAGES.INVALID_PROTOCOL(fullUrlObject.protocol));
    }

    const fullUrl = fullUrlObject.toString();

    const isAllowed = await this.registry.isAllowed(fullUrl, this.userAgent);

    if (!isAllowed) {
      throw new RobotsError(ERROR_MESSAGES.ROBOTS_DENIED(fullUrl, this.userAgent));
    }



    // Set User-Agent header if not present?
    // The previous code snippet did: 'User-Agent': config.headers.userAgent
    // We should probably ensure the request has the UA we checked against.
    if (config.headers) {
      config.headers.set(HEADER_USER_AGENT, this.userAgent);
    }

    return config;
  }
}
