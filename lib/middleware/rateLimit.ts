import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { logger } from '@/lib/utils/logger';

interface RateLimitConfig {
  requests: number;  // Número de solicitudes permitidas
  duration: number;  // Duración en segundos
  identifier?: string;  // Identificador personalizado para el límite
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const createRateLimit = (config: RateLimitConfig) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, `${config.duration}s`),
    analytics: true,
    prefix: `ratelimit:${config.identifier || 'default'}`,
  });
};

export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig
) {
  try {
    const ip = request.ip || 'anonymous';
    const ratelimit = createRateLimit(config);
    
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `${config.identifier || 'default'}_${ip}`
    );

    if (!success) {
      logger.warn('Rate limit exceeded', {
        ip,
        limit,
        reset,
        remaining,
        identifier: config.identifier
      });

      return NextResponse.json(
        { 
          error: 'Too many requests',
          reset,
          limit 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }

    return null;
  } catch (error) {
    logger.error('Rate limit error', error);
    return null;  // En caso de error, permitir la solicitud
  }
} 