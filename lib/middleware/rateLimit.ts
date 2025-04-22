import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { logger } from '@/lib/utils/logger';

export type RateLimitType = 'chat' | 'auth' | 'api';

interface RateLimitConfig {
  requests: number;
  duration: number;
  type: RateLimitType;
}

// Configuraciones predefinidas para diferentes tipos de límites
const RATE_LIMITS: Record<RateLimitType, { requests: number; duration: number }> = {
  chat: { requests: 30, duration: 60 },    // 30 mensajes por minuto (más permisivo)
  auth: { requests: 5, duration: 60 },     // 5 intentos de auth por minuto
  api: { requests: 100, duration: 60 }     // 100 llamadas API por minuto
};

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  logger.warn('Upstash Redis credentials not found, rate limiting will be disabled');
}

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Mejorar el manejo de errores para rate limiting
export async function getRateLimiter(type: RateLimitType) {
  if (!redis) {
    logger.warn('Rate limiting is disabled - Redis not configured');
    return null;
  }

  try {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMITS[type].requests, `${RATE_LIMITS[type].duration} s`),
      analytics: true,
      prefix: `ratelimit:${type}`,
    });
  } catch (error) {
    logger.error('Failed to create rate limiter:', error);
    return null;
  }
}

// Función mejorada para obtener IP del cliente
function getClientIp(request: NextRequest): string {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const realIp = request.headers.get('x-real-ip')?.trim();
    const cfConnectingIp = request.headers.get('cf-connecting-ip')?.trim();
    
    return forwardedFor || realIp || cfConnectingIp || 'anonymous';
  } catch (error) {
    logger.error('Error getting client IP:', error);
    return 'anonymous';
  }
}

export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<NextResponse | null> {
  // Si no hay Redis configurado, permitir todas las solicitudes
  if (!redis) {
    return null;
  }

  try {
    const ip = getClientIp(request);
    const config = RATE_LIMITS[type];
    
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, `${config.duration}s`),
      analytics: true,
      prefix: `ratelimit:${type}`,
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `${type}_${ip}`
    );

    if (!success) {
      logger.warn('Rate limit exceeded', {
        ip,
        type,
        limit,
        reset,
        remaining
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

    // Añadir headers de rate limit incluso en solicitudes exitosas
    const response = new NextResponse(null, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    });

    return response;
  } catch (error) {
    logger.error('Rate limit error', error);
    return null;  // En caso de error, permitir la solicitud
  }
} 