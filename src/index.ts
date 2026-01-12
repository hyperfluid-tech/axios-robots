import { AxiosInstance } from 'axios';
import { RobotsInterceptor } from './interceptor';
import { RobotsPluginOptions } from './types';

export * from './domain/RobotsService';
export * from './errors/RobotsError';
export * from './interceptor';
export * from './types';

/**
 * Apply the robots exclusion protocol interceptor to an Axios instance.
 * @param axiosInstance The axios instance to apply the interceptor to
 * @param options Configuration options (userAgent is required)
 */
export function applyRobotsInterceptor(axiosInstance: AxiosInstance, options: RobotsPluginOptions): void {
  const interceptor = new RobotsInterceptor(options);
  axiosInstance.interceptors.request.use((config) => interceptor.intercept(config));
}
