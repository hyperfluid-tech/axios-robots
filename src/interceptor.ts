import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { RobotsPluginOptions } from './domain/models/RobotsPluginOptions';
import { CrawlDelayComplianceMode } from './domain/models/CrawlDelayComplianceMode';
import { IRobotsDataService } from './domain/interfaces/IRobotsDataService';
import { IAllowService } from './domain/interfaces/IAllowService';
import { ICrawlDelayService } from './domain/interfaces/ICrawlDelayService';
import { RobotsDataService } from './data/services/RobotsDataService';
import { AllowService } from './domain/services/AllowService';
import { CrawlDelayService } from './domain/services/CrawlDelayService';
import { InvalidUrlError } from './errors/InvalidUrlError';
import { InvalidProtocolError } from './errors/InvalidProtocolError';
import { RobotsDeniedError } from './errors/RobotsDeniedError';
import { HEADER_USER_AGENT, PROTOCOL_HTTP, PROTOCOL_HTTPS } from './constants';

export class RobotsInterceptor {
  private dataService: IRobotsDataService;
  private allowService: IAllowService;
  private crawlDelayService: ICrawlDelayService;
  private userAgent: string;
  private crawlDelayCompliance: CrawlDelayComplianceMode;

  constructor(
    options: RobotsPluginOptions,
    deps?: {
      dataService?: IRobotsDataService,
      allowService?: IAllowService,
      crawlDelayService?: ICrawlDelayService;
    }
  ) {
    this.userAgent = options.userAgent;
    this.crawlDelayCompliance = options.crawlDelayCompliance ?? CrawlDelayComplianceMode.Await;

    this.dataService = deps?.dataService ?? new RobotsDataService();
    this.allowService = deps?.allowService ?? new AllowService(this.dataService);
    this.crawlDelayService = deps?.crawlDelayService ?? new CrawlDelayService(this.dataService);
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

    const isAllowed = await this.allowService.isAllowed(url.toString(), this.userAgent);

    if (!isAllowed) {
      throw new RobotsDeniedError(url.toString(), this.userAgent);
    }

    if (this.crawlDelayCompliance !== CrawlDelayComplianceMode.Ignore) {
      await this.crawlDelayService.handleCrawlDelay(url.toString(), this.userAgent, this.crawlDelayCompliance);
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
      this.dataService.setLastCrawled(fullUrl, Date.now());
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
      this.dataService.setLastCrawled(fullUrl, Date.now());
    } catch (_) {
    }

    return Promise.reject(error);
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
      throw new InvalidUrlError(e.message);
    }
  }

  private validateProtocol(url: URL): void {
    if (url.protocol === PROTOCOL_HTTP || url.protocol === PROTOCOL_HTTPS) return;
    throw new InvalidProtocolError(url.protocol);
  }
}
