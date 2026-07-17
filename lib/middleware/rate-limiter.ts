import { NextRequest } from "next/server";
import { RATE_LIMIT } from "@/lib/utils/constants";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = RATE_LIMIT.MAX_GENERAL,
  windowMs: number = RATE_LIMIT.WINDOW_MS
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

export function applyRateLimitHeaders(
  response: Response,
  remaining: number,
  resetTime: number
): Response {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetTime / 1000)));
  return response;
}
