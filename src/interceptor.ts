import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { IRobotsService, RobotsPluginOptions, CrawlDelayComplianceMode } from './types';
import { RobotsService } from './domain/RobotsService';
import { RobotsError } from './errors/RobotsError';
import { HEADER_USER_AGENT, PROTOCOL_HTTP, PROTOCOL_HTTPS } from './constants';
import { ERROR_MESSAGES } from './errors/messages';

export class RobotsInterceptor {
  private robotsService: IRobotsService;
  private userAgent: string;
  private crawlDelayCompliance: CrawlDelayComplianceMode;

  constructor(options: RobotsPluginOptions, robotsService?: IRobotsService) {
    this.robotsService = robotsService || new RobotsService();
    this.userAgent = options.userAgent;
    this.crawlDelayCompliance = options.crawlDelayCompliance ?? CrawlDelayComplianceMode.Await;
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

    const isAllowed = await this.robotsService.isAllowed(url.toString(), this.userAgent);

    if (!isAllowed) {
      throw new RobotsError(ERROR_MESSAGES.ROBOTS_DENIED(url.toString(), this.userAgent));
    }

    if (this.crawlDelayCompliance === CrawlDelayComplianceMode.Await) {
      await this.handleCrawlDelay(url.toString());
    }

    if (config.headers) {
      config.headers.set(HEADER_USER_AGENT, this.userAgent);
    }

    return config;
  }

  /**
   * Intercepts Axios responses to update the last crawled timestamp.
   */
  public interceptResponse(response: AxiosResponse): AxiosResponse {
    if (!response || !response.config || !response.config.url) {
      return response;
    }

    try {
      const fullUrl = this.resolveUrl(response.config as InternalAxiosRequestConfig).toString();
      this.robotsService.setLastCrawled(fullUrl, Date.now());
    } catch (_) {
    }

    return response;
  }

  /**
   * Intercepts Axios response errors to update the last crawled timestamp,
   * ensuring we track attempts even if they fail.
   */
  public interceptResponseError(error: any): any {
    if (!error || !error.config || !error.config.url) {
      return Promise.reject(error);
    }

    try {
      const fullUrl = this.resolveUrl(error.config as InternalAxiosRequestConfig).toString();
      this.robotsService.setLastCrawled(fullUrl, Date.now());
    } catch (_) {
    }

    return Promise.reject(error);
  }

  private async handleCrawlDelay(url: string): Promise<void> {
    const cachedRobot = await this.robotsService.getRobot(url, this.userAgent);

    if (!cachedRobot || !cachedRobot.robot)
      return;


    const delay = cachedRobot.robot.getCrawlDelay(this.userAgent);
    if (!delay || delay <= 0 || !cachedRobot.lastCrawled)
      return;


    const timeSinceLastCrawl = Date.now() - cachedRobot.lastCrawled;
    const waitTime = (delay * 1000) - timeSinceLastCrawl;
    if (waitTime <= 0)
      return;


    await new Promise(resolve => setTimeout(resolve, waitTime));
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
    if (url.protocol === PROTOCOL_HTTP || url.protocol === PROTOCOL_HTTPS) return;
    throw new RobotsError(ERROR_MESSAGES.INVALID_PROTOCOL(url.protocol));
  }
}
