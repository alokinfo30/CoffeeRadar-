/**
 * Enterprise Defense-in-Depth Security: Security Headers Middleware
 * Enforces strict HTTP security headers:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: SAMEORIGIN (or ALLOWALL in preview mode)
 * - Strict-Transport-Security (HSTS)
 * - X-XSS-Protection: 1; mode=block
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy
 */

import { Request, Response, NextFunction } from 'express';

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cross-site scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security for HTTPS enforcement
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent clickjacking while allowing iframe in AI Studio development preview
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Feature policy / Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}
