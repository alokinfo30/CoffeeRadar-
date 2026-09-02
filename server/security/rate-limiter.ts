/**
 * Enterprise Defense-in-Depth Security: Sliding-Window Rate Limiter
 * Tracks requests in real-time sliding windows.
 * - Standard endpoints: 100 requests / 15 minutes (900,000 ms)
 * - AI endpoints: 30 requests / 1 minute (60,000 ms)
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private name: string;

  constructor(options: { windowMs: number; maxRequests: number; name?: string }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.name = options.name || 'RateLimiter';

    // Periodically clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  public check(clientIp: string): {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(clientIp);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(clientIp, entry);
    }

    // Filter out timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    const currentCount = entry.timestamps.length;
    const allowed = currentCount < this.maxRequests;

    if (allowed) {
      entry.timestamps.push(now);
    }

    const remaining = Math.max(0, this.maxRequests - entry.timestamps.length);
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetMs = Math.max(0, oldestTimestamp + this.windowMs - now);

    return {
      allowed,
      remaining,
      limit: this.maxRequests,
      resetMs
    };
  }

  public reset(clientIp?: string): void {
    if (clientIp) {
      this.store.delete(clientIp);
    } else {
      this.store.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      const result = this.check(clientIp);

      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetMs / 1000).toString());

      if (!result.allowed) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit of ${this.maxRequests} requests per ${Math.round(
            this.windowMs / 1000
          )}s exceeded. Please try again in ${Math.ceil(result.resetMs / 1000)} seconds.`,
          limiter: this.name,
          retryAfterSeconds: Math.ceil(result.resetMs / 1000)
        });
        return;
      }

      next();
    };
  }
}

// 100 req per 15 minutes for standard API
export const standardRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  name: 'Standard-API-Limiter'
});

// 30 req per minute for AI and BigQuery query generation endpoints
export const aiEndpointRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  name: 'Gemini-AI-Limiter'
});
