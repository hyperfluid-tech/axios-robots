import { AxiosInstance } from 'axios';
import { RobotsInterceptor } from './interceptor';
import { RobotsPluginOptions } from './domain/models/RobotsPluginOptions';

export * from './data/repositories/RobotsDataRepository';
export * from './domain/services/AllowService';
export * from './domain/services/CrawlDelayService';
export * from './errors';
export * from './interceptor';
export * from './domain/models/RobotsPluginOptions';
export * from './domain/models/CrawlDelayComplianceMode';
export * from './domain/models/CachedRobot';
export * from './domain/interfaces/IRobotsDataRepository';
export * from './domain/interfaces/IAllowService';
export * from './domain/interfaces/ICrawlDelayService';

export * from './domain/models/CachingPolicy';
export * from './domain/models/CachingPolicyType';
export * from './domain/strategies/caching/ICachingStrategy';
export * from './domain/strategies/caching/IndefiniteCachingStrategy';
export * from './domain/strategies/caching/ExpireAfterCachingStrategy';
export * from './domain/strategies/caching/CachingStrategyFactory';
/**
 * Apply the robots exclusion protocol interceptor to an Axios instance.
 * @param axiosInstance The axios instance to apply the interceptor to
 * @param options Configuration options (userAgent is required)
 */
export function applyRobotsInterceptor(axiosInstance: AxiosInstance, options: RobotsPluginOptions): void {
  const interceptor = new RobotsInterceptor(options);
  axiosInstance.interceptors.request.use((config) => interceptor.intercept(config));
  axiosInstance.interceptors.response.use(
    (response) => interceptor.interceptResponse(response),
    (error) => interceptor.interceptResponseError(error)
  );
}
