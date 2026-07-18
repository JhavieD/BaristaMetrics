import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, applyRateLimitHeaders } from "./rate-limiter";
import { securityHeaders } from "./security-headers";
import { generateRequestId } from "@/lib/utils/errors";
import { logRequest, extractRequestInfo } from "./request-logger";
import { RATE_LIMIT } from "@/lib/utils/constants";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export function withApi(handler: RouteHandler, opts?: { rateLimit?: number }) {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const start = Date.now();

    const rateLimitResult = checkRateLimit(
      request,
      opts?.rateLimit ?? RATE_LIMIT.MAX_GENERAL
    );

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId,
            version: "0.1.0",
          },
        },
        { status: 429 }
      );
      applyRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime);
      applySecurityHeaders(response);
      return response;
    }

    try {
      const response = await handler(request, context);
      applyRateLimitHeaders(response, rateLimitResult.remaining, rateLimitResult.resetTime);
      applySecurityHeaders(response);
      response.headers.set("X-Request-Id", requestId);

      const duration = Date.now() - start;
      const { userAgent, ipAddress } = extractRequestInfo(request);

      logRequest({
        requestId,
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        duration,
        userAgent,
        ipAddress,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      const { userAgent, ipAddress } = extractRequestInfo(request);
      logRequest({
        requestId,
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: 500,
        duration,
        userAgent,
        ipAddress,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      const response = NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error instanceof Error
                ? error.message
                : "Unknown error",
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId,
            version: "0.1.0",
          },
        },
        { status: 500 }
      );
      applySecurityHeaders(response);
      return response;
    }
  };
}
