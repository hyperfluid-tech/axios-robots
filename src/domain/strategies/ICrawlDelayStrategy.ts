
export interface ICrawlDelayStrategy {
    execute(url: string, userAgent: string): Promise<void>;
}
