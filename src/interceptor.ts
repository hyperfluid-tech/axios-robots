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
   * Intercepts Axios requests to enforce the Robots Exclusion Protocol.
   */
  public async intercept(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    if (!config.url) {
      return config;
    }

    const url = this.resolveUrl(config);
    this.validateProtocol(url);

    const isAllowed = await this.registry.isAllowed(url.toString(), this.userAgent);

    if (!isAllowed) {
      throw new RobotsError(ERROR_MESSAGES.ROBOTS_DENIED(url.toString(), this.userAgent));
    }

    if (config.headers) {
      config.headers.set(HEADER_USER_AGENT, this.userAgent);
    }

    return config;
  }

  private resolveUrl(config: InternalAxiosRequestConfig): URL {
    try {
      if (config.url && (config.url.startsWith(PROTOCOL_HTTP) || config.url.startsWith(PROTOCOL_HTTPS))) {
        return new URL(config.url);
      }

      if (config.baseURL) {
        return new URL(config.url || '', config.baseURL);
      }

      return new URL(config.url || '');
    } catch (e: any) {
      throw new RobotsError(ERROR_MESSAGES.INVALID_URL(e.message));
    }
  }

  private validateProtocol(url: URL): void {
    if (url.protocol !== PROTOCOL_HTTP && url.protocol !== PROTOCOL_HTTPS) {
      throw new RobotsError(ERROR_MESSAGES.INVALID_PROTOCOL(url.protocol));
    }
  }
}
